
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Dashboard(){
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [players, setPlayers] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [email, setEmail] = useState('')
  const [matchLength, setMatchLength] = useState(90)
  const [team, setTeam] = useState('Weavers Arms FC')

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if(!data.session) { router.push('/'); return }
      setSession(data.session)
      fetchPlayers()
    })
  },[])

  async function fetchPlayers(){
    const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: false })
    if(error) return alert(error.message)
    setPlayers(data || [])
  }

  async function addPlayer(){
    if(!name) return alert('Name required')
    const res = await fetch('/api/create-player', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, number, team, matchLength, email }) })
    const body = await res.json()
    if(body.error) return alert(body.error)
    setName(''); setNumber(''); setEmail('')
    fetchPlayers()
  }

  async function resendLink(token){
    const url = `${window.location.origin}/pay/${token}`
    navigator.clipboard.writeText(url)
    alert('Payment link copied to clipboard: ' + url)
  }

  return <div className="container">
    <header><h1>Weavers Arms FC — Admin Dashboard</h1></header>
    <p>Signed in as {session?.user?.email}</p>
    <label>Team: <input value={team} onChange={e=>setTeam(e.target.value)} /></label>
    <label>Match length: <input type="number" value={matchLength} onChange={e=>setMatchLength(Number(e.target.value))} /></label>
    <h2>Add player</h2>
    <div style={{display:'flex',gap:8}}>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Number" value={number} onChange={e=>setNumber(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <button onClick={addPlayer}>Create player & link</button>
    </div>
    <h2>Players</h2>
    <table>
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Token</th><th>Paid?</th><th>Actions</th></tr></thead>
      <tbody>
        {players.map(p=> (
          <tr key={p.id}>
            <td>{p.number}</td>
            <td>{p.name}</td>
            <td>{p.email}</td>
            <td style={{maxWidth:300,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.pay_token}</td>
            <td>{p.paid ? '✅' : '—'}</td>
            <td><button onClick={()=>resendLink(p.pay_token)}>Copy link</button></td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{marginTop:12}}><button onClick={()=>supabase.auth.signOut().then(()=>router.push('/'))}>Sign out</button></div>
  </div>
}

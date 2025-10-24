
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home(){
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')

  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      setSession(data.session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, sess)=> setSession(sess))
  },[])

  const signIn = async ()=>{
    if(!email) return alert('Enter email for magic link')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if(error) return alert(error.message)
    alert('Check your email for a login link (magic link).')
  }

  if(loading) return <div className="container"><header><h1>Weavers Arms FC — Subs Pay</h1></header><p className="small">Loading...</p></div>
  if(session) return <div className="container"><header><h1>Weavers Arms FC — Subs Pay</h1></header><p>Signed in as {session.user.email}</p><p><a href="/admin/dashboard">Go to dashboard</a></p><button onClick={()=>supabase.auth.signOut()}>Sign out</button></div>

  return <div className="container">
    <header><h1>Weavers Arms FC — Admin Sign In</h1></header>
    <p className="small">Sign in with email (magic link) via Supabase Auth.</p>
    <input placeholder="you@domain.com" value={email} onChange={e=>setEmail(e.target.value)} />
    <div style={{marginTop:8}}><button onClick={signIn}>Send magic link</button></div>
  </div>
}

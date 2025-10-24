
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function PayToken(){
  const router = useRouter(); const { token } = router.query
  const [player, setPlayer] = useState(null)
  const [minutes, setMinutes] = useState(0)
  const [rate, setRate] = useState(0.10)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!token) return
    fetch('/api/player-by-token?token=' + encodeURIComponent(token)).then(r=>r.json()).then(data=>{
      if(data.error) { setPlayer(null); setLoading(false); return alert(data.error) }
      setPlayer(data.player); setMinutes(data.player.match_length || 90); setLoading(false)
    })
  },[token])

  async function pay(){
    if(!player) return
    const amount = Math.max(0, Math.round(minutes * rate * 100))
    const res = await fetch('/api/create-checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, minutes, amount }) })
    const js = await res.json()
    if(js.url) window.location = js.url
    else alert(js.error || 'Checkout failed')
  }

  if(loading) return <div className="container"><p className="small">Loading…</p></div>
  if(!player) return <div className="container"><p className="small">Invalid or expired link.</p></div>
  return <div className="container">
    <h1>Pay — {player.team}</h1>
    <p>Player: <strong>{player.name}</strong></p>
    <label>Minutes played: <input type="number" value={minutes} min="0" max={player.match_length || 90} onChange={e=>setMinutes(Number(e.target.value))} /></label>
    <label>Rate per minute: <input type="number" step="0.01" value={rate} onChange={e=>setRate(Number(e.target.value))} /></label>
    <p>Total: <strong>{(minutes*rate).toFixed(2)}</strong></p>
    <button onClick={pay}>Pay (Stripe Checkout — Apple Pay available on supported devices)</button>
  </div>
}

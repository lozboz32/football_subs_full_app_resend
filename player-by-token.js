
import { supabaseAdmin } from '../../lib/supabaseServer'

export default async function handler(req, res){
  const { token } = req.query
  if(!token) return res.status(400).json({ error: 'Missing token' })
  const { data, error } = await supabaseAdmin.from('players').select('*').eq('pay_token', token).single()
  if(error || !data) return res.status(404).json({ error: 'Player not found' })
  res.status(200).json({ player: data })
}

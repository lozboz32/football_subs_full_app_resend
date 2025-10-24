
import { supabaseAdmin } from '../../lib/supabaseServer'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, number, team, matchLength, email } = req.body
  if(!name) return res.status(400).json({ error: 'Name required' })
  const token = uuidv4()
  const { data, error } = await supabaseAdmin.from('players').insert([{ name, number, team, match_length: matchLength || 90, pay_token: token, paid: false, email }]).select().single()
  if(error) return res.status(500).json({ error: error.message })
  res.status(200).json({ player: data })
}


import Stripe from 'stripe'
import { supabaseAdmin } from '../../lib/supabaseServer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { token, minutes, amount } = req.body
  if(!token || !amount) return res.status(400).json({ error: 'Missing data' })
  const { data: player, error } = await supabaseAdmin.from('players').select('*').eq('pay_token', token).single()
  if(error || !player) return res.status(404).json({ error: 'Player not found' })
  try{
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: process.env.CURRENCY || 'gbp',
          product_data: { name: `Match fee — ${player.team}`, description: `${player.name} — ${minutes} minutes`, metadata: { player_id: player.id, pay_token: token } },
          unit_amount: amount
        },
        quantity: 1
      }],
      metadata: { player_id: player.id, pay_token: token, minutes: String(minutes) },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cancel`
    })
    res.status(200).json({ url: session.url })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

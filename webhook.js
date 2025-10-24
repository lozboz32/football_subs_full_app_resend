
import Stripe from 'stripe'
import { buffer } from 'micro'
import { supabaseAdmin } from '../../lib/supabaseServer'
import { sendReceipt } from '../../lib/email'

export const config = { api: { bodyParser: false } }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res){
  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)
  let event
  try{
    event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET)
  }catch(err){
    console.error('Webhook signature error', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  if(event.type === 'checkout.session.completed'){
    const session = event.data.object
    const playerId = session.metadata?.player_id
    const amount_total = session.amount_total
    const minutes = session.metadata?.minutes ? Number(session.metadata.minutes) : null
    try{
      // mark payment in payments table and set player.paid = true
      await supabaseAdmin.from('payments').insert([{ player_id: playerId, amount: amount_total, currency: session.currency, stripe_session_id: session.id }])
      await supabaseAdmin.from('players').update({ paid: true }).eq('id', playerId)
      // fetch player to get email and details
      const { data: player } = await supabaseAdmin.from('players').select('*').eq('id', playerId).single()
      if(player && player.email){
        // send receipt email using Resend
        await sendReceipt({ to: player.email, name: player.name, team: player.team || 'Weavers Arms FC', amount: amount_total, minutes, currency: session.currency, playerName: player.name })
      }else{
        console.log('No player email to send receipt to for', playerId)
      }
      console.log('Marked player paid', playerId)
    }catch(err){
      console.error('Supabase update or email error', err)
    }
  }
  res.status(200).json({ received: true })
}


Weavers Arms FC — Full App (Supabase + Stripe + Resend Email Receipts)
=====================================================================

Overview
- This project implements a hosted web-app where admins create player payment links and players pay via Stripe Checkout.
- After successful payment, a receipt email in Weavers Arms FC branding (red & black) is sent using Resend from `no-reply@weaversarmsfc.com`.

Important environment variables (set in Vercel / host)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY     (server only — keep secret)
- STRIPE_SECRET_KEY             (server)
- STRIPE_WEBHOOK_SECRET         (server — from Stripe dashboard when creating webhook endpoint)
- NEXT_PUBLIC_BASE_URL          (e.g., https://payments.weaversarmsfc.com)
- CURRENCY                      (e.g., gbp)
- RESEND_API_KEY                (from Resend)
- RESEND_FROM                   (e.g., no-reply@weaversarmsfc.com) - optional, defaults to that address

Resend domain verification (required to send from no-reply@weaversarmsfc.com)
1. Sign up at https://resend.com and go to "Sending Domains".
2. Add `weaversarmsfc.com` as a sending domain and follow the verification steps. Resend will provide DNS records (TXT and CNAME) you must add to your domain's DNS provider.
3. Add the TXT records exactly as Resend shows, then click "Verify" in Resend. DNS can take a few minutes to hours to propagate.
4. Once verified, set `RESEND_FROM=no-reply@weaversarmsfc.com` and `RESEND_API_KEY` in your Vercel environment variables.

Stripe webhook setup
1. In Stripe Dashboard -> Developers -> Webhooks, create an endpoint: `https://your-domain.com/api/webhook` and subscribe to `checkout.session.completed` events.
2. Copy the signing secret and set `STRIPE_WEBHOOK_SECRET` in your environment.

Supabase setup
1. Create a Supabase project.
2. Run the SQL in `supabase_init.sql` to create `players` and `payments` tables.
3. Get your project URL and anon key; put them in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Put the `SUPABASE_SERVICE_ROLE_KEY` in server env (do NOT expose this client-side).

Workflow
- Admin signs in at site root with magic-link and goes to /admin/dashboard.
- Admin creates players (name, number, email). The API returns a secure token; admin copies the link `/pay/<token>` to the player.
- Player opens link, enters minutes, pays. Stripe Checkout handles Apple Pay automatically on supported devices and verified domains.
- On payment success, the webhook marks the player paid and sends a branded receipt from `no-reply@weaversarmsfc.com` via Resend.

Local development
- Use `.env.local` with keys for local testing. For webhook testing, use Stripe CLI to forward events to your local server (and set STRIPE_WEBHOOK_SECRET accordingly).

Next steps I can help with
- Deploy to Vercel and set up Stripe webhook + Resend sending domain (I can provide exact Vercel env var inputs).
- Add email templates or attach PDF receipts.
- Add admin CSV export of payments and unpaid players.


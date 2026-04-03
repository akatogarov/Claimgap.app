# ClaimGap (claimgap.app)

AI-assisted insurance claim analysis: users upload a policy PDF and a settlement PDF, receive a preview, pay once to unlock a full analysis and counter-offer letter.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + `claims` / `outcomes` tables)
- Anthropic Claude (Haiku for preview, Sonnet 4 for full analysis)
- Stripe Checkout ($149 one-time)
- Resend (transactional email)
- Deploy: Cloudflare Pages via `@cloudflare/next-on-pages` (see [Cloudflare docs](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/))

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.local.example` to `.env.local` and fill in values. Never commit `.env.local`.

   - Use **Supabase service role** key only on the server (analyze, webhook, admin APIs). The anon key alone is not enough if Row Level Security blocks inserts.
   - **Stripe**: Create a product/price or rely on the API’s inline `price_data` (already in code). Add a webhook endpoint pointing to `https://<your-domain>/api/webhook` and subscribe to `checkout.session.completed`. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
   - **Resend**: Verify your domain, then set `RESEND_FROM_EMAIL` to an address on that domain (the default `onboarding@resend.dev` only works for testing to your own email).

3. **Admin access**

   - Set `ADMIN_EMAILS` (comma-separated), `ADMIN_SECRET` (shared password), and `ADMIN_JWT_SECRET` (long random string).
   - Open `/admin/login`, sign in with an allowed email and `ADMIN_SECRET`, then use `/admin` to browse recent claims.

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **Cloudflare Pages build**

   ```bash
   npm run build
   npx @cloudflare/next-on-pages
   ```

   Follow Cloudflare’s Next.js deployment guide for environment variables and the `nodejs_compat` compatibility flag if PDF parsing requires it.

## PDF text extraction

API routes use the **`unpdf`** package so extraction can run on the Edge runtime alongside Cloudflare. If you switch to `pdf-parse`, you may need the Node.js runtime for that route instead of Edge.

## Security notes

- If API keys or secrets were ever pasted into a chat or committed to git, **rotate them** in Anthropic, Stripe, Supabase, and Resend.
- Stripe **publishable** keys start with `pk_`; **secret** keys start with `sk_`. The values you use must match the Stripe dashboard.

## Database shape (expected)

**claims**: `id`, `email`, `insurance_type`, `insurer`, `state`, `description`, `offer_amount`, `status` (`preview` | `paid` | `failed`), `stripe_session_id`, `analysis` (jsonb), `created_at`.

**outcomes**: `id`, `claim_id`, `result` (`yes` | `no` | `negotiating`), `additional_amount`, `reported_at`.

The `analysis` JSON stores `preview`, optional `full` (after payment), and `extracted.policy_text` / `extracted.settlement_text` for the webhook’s full Claude run.

If the table does not exist yet, run `supabase/schema.sql` in the Supabase SQL Editor (recommended — no database password needed).

### “Database authentication failed” (SQL Editor or `npm run db:apply`)

This is the **Postgres user password**, not the API anon/service keys.

1. **Supabase → Project Settings → Database → Reset database password** — set a new password and save.
2. If you use **`DATABASE_URL`** in `.env.local`, copy the **Connection string → URI** again from the dashboard after reset (it contains the new password). Passwords with special characters (`@`, `#`, `/`, `%`, `+`) must be **URL-encoded** in the URI, or paste the URI exactly as Supabase’s **Copy** button provides it.
3. **Easiest path:** open **SQL Editor**, paste the contents of `supabase/schema.sql`, click **Run** — no `DATABASE_URL` required.

### “Could not save your claim” (500 on `/api/analyze`)

The PDF step already succeeded; the failure is the **Supabase insert** into `claims`.

1. Set **`SUPABASE_SERVICE_ROLE_KEY`** in `.env.local` (Supabase → Project Settings → API → `service_role` secret). Server routes need this key so inserts are not blocked by Row Level Security. The anon key is a common cause of silent insert failures when RLS has no INSERT policy.
2. Confirm the **`claims`** table exists (run `supabase/schema.sql` if needed).
3. In **development**, the API response includes the real Postgres/PostgREST error and `code: "db_insert_failed"` so you can see RLS vs missing table vs other issues.

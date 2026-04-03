-- Run in Supabase → SQL Editor if tables are missing.
-- API routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). Anon key alone often fails INSERT when RLS is enabled.
--
-- IMPORTANT (Supabase UI):
-- Use the green RUN button (▶ Run), NOT "Explain" / "Analyze".
-- Explain only accepts ONE statement; this file has several. Select all → Run once.

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  insurance_type text not null,
  insurer text not null,
  state text not null,
  description text not null,
  offer_amount numeric,
  -- status: preview | awaiting_clarification | paid | failed
  status text not null default 'preview',
  stripe_session_id text,
  analysis jsonb,
  created_at timestamptz not null default now()
);

create index if not exists claims_created_at_idx on public.claims (created_at desc);
create index if not exists claims_status_idx on public.claims (status);

create table if not exists public.outcomes (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  result text not null,
  additional_amount numeric,
  reported_at timestamptz not null default now()
);

create index if not exists outcomes_claim_id_idx on public.outcomes (claim_id);

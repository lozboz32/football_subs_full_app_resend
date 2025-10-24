
-- Run this in your Supabase SQL editor
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number text,
  email text,
  team text,
  match_length int default 90,
  pay_token text unique,
  paid boolean default false,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete set null,
  amount bigint,
  currency text,
  stripe_session_id text,
  created_at timestamptz default now()
);

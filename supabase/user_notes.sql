create extension if not exists pgcrypto;

create table if not exists public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  user_email text not null unique,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_notes enable row level security;

create policy if not exists "user_notes_select_own"
on public.user_notes
for select
using (auth.uid() = user_id);

create policy if not exists "user_notes_insert_own"
on public.user_notes
for insert
with check (auth.uid() = user_id);

create policy if not exists "user_notes_update_own"
on public.user_notes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

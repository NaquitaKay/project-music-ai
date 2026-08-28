-- Saved melody/chord progressions from the Chord Suggester and Melody to
-- Chords tools. Replaces the previous browser-localStorage-only storage.

create table if not exists public.progressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('chord-suggester', 'melody-to-chords')),
  name text not null default 'Untitled progression',
  melody jsonb not null,
  harmonization jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists progressions_user_id_idx
  on public.progressions (user_id);

alter table public.progressions enable row level security;

create policy "progressions_select_own" on public.progressions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "progressions_insert_own" on public.progressions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "progressions_update_own" on public.progressions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "progressions_delete_own" on public.progressions
  for delete
  to authenticated
  using (user_id = auth.uid());

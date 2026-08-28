-- Adds an admin flag to profiles, plus an RLS-safe way for admins to read
-- every user's profile/progressions for the admin dashboard.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Users can update their own profile row (profiles_update_own), but that
-- policy has no column restriction - without this, a user could flip their
-- own is_admin to true. Revoke write access to just this column.
revoke update (is_admin) on public.profiles from authenticated;

-- security definer + stable: runs as the function owner, bypassing RLS for
-- this one lookup. Without security definer, calling this from a profiles
-- policy would re-trigger profiles RLS mid-evaluation (infinite recursion).
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = user_id), false);
$$;

-- Additional (not replacing) SELECT policies: Postgres OR's multiple
-- permissive policies for the same command, so non-admins are unaffected
-- (their own-row policy still applies) and admins additionally see everything.
create policy "profiles_select_admin" on public.profiles
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "progressions_select_admin" on public.progressions
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

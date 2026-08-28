-- Profile row for each authenticated user, auto-created on signup via a
-- trigger on auth.users. Not yet surfaced in any UI, but gives future
-- features (display name, avatar, etc.) a place to live.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No insert/delete policies for authenticated/anon: rows are created by the
-- trigger below (security definer) and removed via the auth.users cascade.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

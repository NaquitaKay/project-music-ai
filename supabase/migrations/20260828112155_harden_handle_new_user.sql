-- The auth.users insert trigger runs handle_new_user() in the same
-- transaction: if that function raises, the whole signup is rolled back
-- and the user is never created (surfaced to the client as a generic auth
-- error, e.g. "Database error saving new user"). Make it exception-safe and
-- idempotent so a profiles-table hiccup can never block real signups.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
exception
  when others then
    return new;
end;
$$;

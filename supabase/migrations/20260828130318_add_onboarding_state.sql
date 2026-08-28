-- Tracks whether a user has completed (or skipped) the onboarding flow.
-- Null = show onboarding on their next authenticated request (see
-- src/lib/supabase/middleware.ts). Backfill existing profiles as already
-- onboarded so this doesn't retroactively force onboarding on accounts
-- created before this feature existed.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

update public.profiles
  set onboarding_completed_at = created_at
  where onboarding_completed_at is null;

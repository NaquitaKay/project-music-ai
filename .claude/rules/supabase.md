# Database Migrations

All database schema changes must go through Supabase CLI migrations — never modify the database manually.

## Workflow

1. Create a new migration:
   ```bash
   npx supabase migration new <short_description>
   ```
   This creates a timestamped SQL file in `supabase/migrations/`.

2. Write your SQL in the generated file. Follow these rules:
   - Add a header comment explaining the purpose
   - Always enable RLS: `alter table <table> enable row level security;`
   - Write granular RLS policies: one per operation (`select`, `insert`, `update`, `delete`) and per role (`anon`, `authenticated`). Never use `FOR ALL`.
   - Use `if not exists` / `if exists` guards where appropriate
   - Add indexes on columns referenced in RLS policies that are not already primary keys

3. Test locally:
   ```bash
   npx supabase db reset
   ```
   This destroys and recreates the local DB, replaying all migrations from scratch.

4. Check migration status:
   ```bash
   npx supabase migration list
   ```

5. Deploy to remote (after `supabase link`):
   ```bash
   npx supabase db push --dry-run   # preview first
   npx supabase db push             # apply
   ```

## Rules

- Never reset or revert a migration that has been deployed to production — always roll forward
- Never modify an existing migration file after it has been applied — create a new one instead
- Commit all migration files to version control

## Admin-visibility pattern

To let admins read every row of a table that otherwise restricts access to `id = auth.uid()` (see `profiles`/`progressions`), add an RLS policy per table using the shared `public.is_admin(uuid)` helper (defined in `add_admin_role` migration) rather than a service-role key:

```sql
create policy "<table>_select_admin" on public.<table>
  for select
  to authenticated
  using (public.is_admin(auth.uid()));
```

This is additive — Postgres OR's multiple permissive policies for the same command, so existing per-user policies are unaffected. `is_admin()` is `security definer`, which is what lets it read `profiles.is_admin` without recursing into `profiles`' own RLS.

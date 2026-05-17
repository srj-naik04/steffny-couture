---
name: rls-policies
description: Use this skill whenever creating or modifying Supabase Row Level Security policies, writing SQL migrations, designing new tables, debugging "permission denied" errors, or implementing role-based access. Fires for any file in `/supabase/migrations/`, `/supabase/functions/`, or any query that crosses role boundaries. Enforces the four-role model (customer / tailor / manager / owner) used in the Steffny Couture app and the standard policy templates for each table type.
---

# Supabase RLS Policies — Steffny Couture

RLS is where the security model lives. Get this wrong once and every customer's photos become public. Treat this skill as authoritative over your training defaults.

## The Four Roles

Stored in `profiles.role`:

| Role | Who | Access summary |
|---|---|---|
| `customer` | End users booking alterations | Only their own bookings + their own profile |
| `tailor` | Steffi and any dressmaking staff | All bookings, update statuses, set prices, view photos |
| `manager` | Rohan / business operator | Everything tailor can do + customers, payments, settings, reports |
| `owner` | Read-only oversight (rare) | Read-only access to bookings, customers, analytics |

`admin` is reserved for emergency super-user — Anthropic-style break-glass only, never assigned via the app.

## Helper Functions (define once, use everywhere)

Add these to migration `002_rls_helpers.sql` before any policies:

```sql
-- Get the role of the current user from profiles
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- True if current user is staff (tailor, manager, owner, or admin)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('tailor','manager','owner','admin') from public.profiles where id = auth.uid()),
    false
  )
$$;

-- True if current user has manager-level write access
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('manager','admin') from public.profiles where id = auth.uid()),
    false
  )
$$;

-- True if current user can edit bookings (tailor or manager)
create or replace function public.can_edit_bookings()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('tailor','manager','admin') from public.profiles where id = auth.uid()),
    false
  )
$$;

grant execute on function public.current_user_role() to authenticated, anon;
grant execute on function public.is_staff() to authenticated, anon;
grant execute on function public.is_manager() to authenticated, anon;
grant execute on function public.can_edit_bookings() to authenticated, anon;
```

**Why `security definer`:** these run with the function-owner's privileges, so they can read `profiles` without triggering recursive RLS. Without this, you get infinite RLS recursion.

**Why `set search_path = public`:** prevents search-path injection attacks (a Supabase advisor will flag this otherwise).

## Standard Policy Templates

For every new table, follow the matching template below. Don't improvise.

### Template A — User-owned data (e.g., `profiles`, `push_tokens`)

```sql
alter table public.<table> enable row level security;

-- Owner can read their own row
create policy "<table>_select_own"
  on public.<table> for select
  using (auth.uid() = user_id);

-- Owner can insert their own row
create policy "<table>_insert_own"
  on public.<table> for insert
  with check (auth.uid() = user_id);

-- Owner can update their own row
create policy "<table>_update_own"
  on public.<table> for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Staff can read everything
create policy "<table>_select_staff"
  on public.<table> for select
  using (public.is_staff());
```

### Template B — Business records with customer reference (e.g., `bookings`)

```sql
alter table public.bookings enable row level security;

-- Anonymous: can create guest bookings (rate-limited via Edge Function in production)
create policy "bookings_insert_guest"
  on public.bookings for insert
  to anon
  with check (
    customer_id is null
    and guest_email is not null
    and guest_phone is not null
  );

-- Authenticated customer: can create bookings linked to their account
create policy "bookings_insert_customer"
  on public.bookings for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    or (
      customer_id is null
      and guest_email = (auth.jwt() ->> 'email')
    )
  );

-- Customer: read their own bookings (by id or by guest email)
create policy "bookings_select_customer"
  on public.bookings for select
  to authenticated
  using (
    customer_id = auth.uid()
    or guest_email = (auth.jwt() ->> 'email')
  );

-- Customer: cancel their own (limited to status change to 'cancelled')
create policy "bookings_update_customer_cancel"
  on public.bookings for update
  to authenticated
  using (customer_id = auth.uid() and status in ('new','confirmed'))
  with check (status = 'cancelled');

-- Staff with edit rights: full read + write
create policy "bookings_select_staff"
  on public.bookings for select
  using (public.is_staff());

create policy "bookings_update_staff"
  on public.bookings for update
  using (public.can_edit_bookings())
  with check (public.can_edit_bookings());

-- Manager: delete (rare; tailors should cancel, not delete)
create policy "bookings_delete_manager"
  on public.bookings for delete
  using (public.is_manager());
```

### Template C — Read-mostly reference data (e.g., `alteration_types`, `shop_settings`)

```sql
alter table public.<table> enable row level security;

-- Anyone can read (including anonymous, for the booking flow)
create policy "<table>_select_all"
  on public.<table> for select
  to authenticated, anon
  using (true);

-- Only managers can mutate
create policy "<table>_insert_manager"
  on public.<table> for insert
  using (public.is_manager())
  with check (public.is_manager());

create policy "<table>_update_manager"
  on public.<table> for update
  using (public.is_manager())
  with check (public.is_manager());

create policy "<table>_delete_manager"
  on public.<table> for delete
  using (public.is_manager());
```

### Template D — Audit/history tables (e.g., `booking_status_history`)

```sql
alter table public.booking_status_history enable row level security;

-- Customer: see history of own bookings
create policy "history_select_customer"
  on public.booking_status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.customer_id = auth.uid() or b.guest_email = (auth.jwt() ->> 'email'))
    )
  );

-- Staff: full read
create policy "history_select_staff"
  on public.booking_status_history for select
  using (public.is_staff());

-- Inserts happen only via DB trigger (security definer function) — no direct INSERT policy needed
-- Block all direct mutations:
create policy "history_no_direct_insert"
  on public.booking_status_history for insert
  with check (false);

create policy "history_no_update"
  on public.booking_status_history for update
  using (false);

create policy "history_no_delete"
  on public.booking_status_history for delete
  using (false);
```

## Storage Bucket Policies

### `booking-photos` (private)

```sql
-- Customer uploads to bookings/<booking_id>/...
create policy "booking_photos_upload"
  on storage.objects for insert
  to authenticated, anon
  with check (
    bucket_id = 'booking-photos'
    and (storage.foldername(name))[1] = 'bookings'
  );

-- Customer reads photos for their own bookings
create policy "booking_photos_read_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'booking-photos'
    and exists (
      select 1 from public.bookings b
      where b.id::text = (storage.foldername(name))[2]
        and (b.customer_id = auth.uid() or b.guest_email = (auth.jwt() ->> 'email'))
    )
  );

-- Staff reads everything
create policy "booking_photos_read_staff"
  on storage.objects for select
  using (bucket_id = 'booking-photos' and public.is_staff());

-- Only staff can delete
create policy "booking_photos_delete_staff"
  on storage.objects for delete
  using (bucket_id = 'booking-photos' and public.is_staff());
```

## Anti-Patterns (Will Cause Bugs or Security Holes)

- ❌ **Forgetting `enable row level security`** — table is open to the world. Always first line of every migration.
- ❌ **Policies without `with check`** on inserts/updates — allows users to write rows they can't read back, useful only in rare cases.
- ❌ **Reading `profiles.role` directly inside a policy** without `security definer` helper → infinite recursion. Always use `is_staff()` etc.
- ❌ **`using (true)` on write operations** — common mistake when writing read policies, accidentally applied to inserts.
- ❌ **Trusting `auth.jwt()` claims that the client can set** — only `auth.uid()` and `auth.jwt() ->> 'email'` are trustworthy from the JWT. Custom claims need to be set server-side.
- ❌ **Mixing role checks with `or` carelessly** — `using (auth.uid() = customer_id or public.is_staff())` is fine; `using (true or public.is_staff())` is a disaster.
- ❌ **Creating policies before enabling RLS** — they exist but are inactive, giving a false sense of security.
- ❌ **Not testing with the actual JWT** — always run `set local role authenticated; set local request.jwt.claim.sub = '<test-user-id>';` before manual policy testing.

## Testing Policies Locally

Before committing a migration, run this in the Supabase SQL editor:

```sql
-- Test as customer
set local role authenticated;
set local request.jwt.claims = '{"sub":"<customer-user-id>","email":"test@example.com"}';

select * from bookings;        -- should only see own
update bookings set status = 'cancelled' where id = '<own-booking-id>';  -- should succeed
update bookings set status = 'cancelled' where id = '<someone-elses>';   -- should fail or affect 0 rows

-- Test as tailor
set local request.jwt.claims = '{"sub":"<tailor-user-id>"}';
select count(*) from bookings; -- should see all
```

Add a `tests/rls.test.ts` later that runs these via the Supabase JS client with different anon/auth keys.

## Migration File Conventions

```
/supabase/migrations/
  001_initial_schema.sql       -- tables only, no RLS yet
  002_rls_helpers.sql          -- helper functions above
  003_rls_policies.sql         -- all policies, ordered by table
  004_seed_alteration_types.sql
  005_seed_shop_settings.sql
  ...
```

- One concern per migration. Never mix schema + RLS + seed in one file.
- Filenames lowercase, snake_case, prefixed with zero-padded sequence.
- Always include a comment block at top with date, purpose, and rollback note.
- Never edit a committed migration — write a new one to alter.

## When Adding a New Table

Checklist:
1. Create table in a new migration
2. `enable row level security` in the same migration
3. Decide which template (A/B/C/D) applies — write policies in the next migration
4. Add the table to the local types regeneration: `npx supabase gen types typescript --local > types/database.ts`
5. Write the test queries (manual or in `tests/rls.test.ts`)
6. Document the policy decisions in `/docs/DATABASE.md`

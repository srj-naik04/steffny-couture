# Database

Reference for the Steffny Couture Postgres schema as hosted on Supabase.

## ER Overview

```
profiles ──── auth.users (1:1)
   │
   │ (customer_id)
   ▼
bookings ──── alteration_types  (many:1)
   │
   ├── booking_status_history (1:many)
   └── storage.objects (1:many photos)

shop_settings (singleton)
push_tokens ──── profiles (many:1)
```

## Tables

(Filled in as migrations are added. See `/supabase/migrations/` for the source of truth.)

### `profiles`
Extends `auth.users`. Stores `role` (`customer | tailor | manager | owner | admin`), `full_name`, `phone`, `avatar_url`.

### `alteration_types`
Reference data — populated via seed. Hem, Take In, Sleeves, etc.

### `bookings`
The core entity. References `profiles` (customer) and `alteration_types`. Has photo URLs stored as text array referencing storage paths.

### `booking_status_history`
Append-only audit log. Inserted via trigger when `bookings.status` changes.

### `shop_settings`
Singleton row (`id = 1`). Hours per day, blocked dates, slot duration, shop contact info.

### `push_tokens`
Per-device Expo push tokens scoped to a profile.

## RLS Roles

See `.claude/skills/rls-policies/SKILL.md` for the four-role model and policy templates. Helper functions `is_staff()`, `is_manager()`, `can_edit_bookings()` defined in migration `002_rls_helpers.sql`.

## Storage Buckets

- `booking-photos` — private. Path: `bookings/<booking_id>/<timestamp>.<ext>`.
- `profile-avatars` — public read.

## Adding a Table

1. New migration: `00X_<name>.sql` — table + RLS enable
2. Next migration: `00Y_<name>_policies.sql` — RLS policies
3. Regenerate types: `npx supabase gen types typescript --local > types/database.ts`
4. Add a feature folder if user-facing: `/features/<feature>/`
5. Document the table in this file
6. Add policy templates note to `.claude/skills/rls-policies/SKILL.md` if the table introduces a new pattern

## Generated Types

`/types/database.ts` is generated. Never edit by hand.
```bash
npx supabase gen types typescript --local > types/database.ts
```
Commit the regenerated file alongside any schema migration.

## Performance Notes

- Indexes on: `bookings.status`, `bookings.appointment_date`, `bookings.customer_id`, `booking_status_history.booking_id`
- Reference tables (`alteration_types`, `shop_settings`) cached with `staleTime: Infinity` in TanStack Query
- Pagination: `.range(0, 49)` on any list expected to grow beyond 100 rows

## Migrations Inventory

(Update as migrations are added.)

```
001_initial_schema.sql        — tables, no RLS yet
002_rls_helpers.sql            — current_user_role, is_staff, is_manager
003_rls_policies.sql           — RLS on all tables
004_seed_alteration_types.sql  — Hem, Take In, etc.
005_seed_shop_settings.sql     — Singleton row
...
```

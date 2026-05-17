---
description: Create a new Supabase SQL migration file with the project's standard header.
argument-hint: <short_snake_case_name>
---

# New Migration: $1

Create a new file at `/supabase/migrations/<NNN>_$1.sql` where `<NNN>` is the next zero-padded sequence number after the latest migration in that directory.

## Template

```sql
-- =============================================================================
-- Migration: $1
-- Created: <today's date>
-- Purpose: <one-line purpose>
--
-- Tables touched: <list>
-- Rollback: <how to rollback if needed, or "schema only — no rollback path">
-- =============================================================================

-- (your SQL here)
```

## Rules (auto-load `rls-policies` skill)

- One concern per migration. Never mix schema + RLS + seed.
- If creating a table, `enable row level security` in the same migration immediately after `create table`.
- If creating policies, do that in a separate migration that follows.
- All new tables must have:
  - `id uuid primary key default gen_random_uuid()` (unless intentionally different)
  - `created_at timestamptz default now()`
  - `updated_at timestamptz default now()` + trigger
- Index foreign keys and frequently-filtered columns.
- Comment any non-obvious column with `comment on column ... is '...';`
- Never edit a committed migration — write a new altering migration instead.

## After creating

1. Show me the file
2. Confirm sequence number is correct (check folder)
3. Suggest the matching policies migration if you created a table
4. Remind me to run `npx supabase db push` and `npx supabase gen types typescript --local > types/database.ts`
5. Suggest a Conventional Commit message for the migration

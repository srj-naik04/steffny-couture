-- Migration: 006_grants
-- Date:      2026-05-17
-- Purpose:   Grant table/sequence/function privileges to the API roles
--            (anon, authenticated, service_role). Tables created via raw SQL
--            migrations do not inherit Supabase's default privileges, so
--            without this every API call fails with "permission denied".
-- Rollback:  revoke the grants.
-- Security:  RLS (migration 003) is the real gate — these grants are broad by
--            design; Postgres still evaluates row policies on every access.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
  on all tables in schema public
  to anon, authenticated, service_role;

grant usage, select
  on all sequences in schema public
  to anon, authenticated, service_role;

grant execute
  on all functions in schema public
  to anon, authenticated, service_role;

-- Apply the same defaults to anything created in public later.
alter default privileges in schema public
  grant select, insert, update, delete on tables
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant usage, select on sequences
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant execute on functions
  to anon, authenticated, service_role;

-- Migration: 002_rls_helpers
-- Date:      2026-05-17
-- Purpose:   Security-definer helper functions used by every RLS policy.
--            They read profiles.role without triggering recursive RLS.
-- Rollback:  drop the four functions.
-- Roles:     customer / tailor / manager / owner  (+ admin break-glass).

-- Role of the current user.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- True for any staff member (tailor, manager, owner, admin).
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('tailor', 'manager', 'owner', 'admin')
       from public.profiles where id = auth.uid()),
    false
  )
$$;

-- True for manager-level write access.
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('manager', 'admin')
       from public.profiles where id = auth.uid()),
    false
  )
$$;

-- True for users who can edit bookings (tailor or manager).
create or replace function public.can_edit_bookings()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('tailor', 'manager', 'admin')
       from public.profiles where id = auth.uid()),
    false
  )
$$;

grant execute on function public.current_user_role() to authenticated, anon;
grant execute on function public.is_staff() to authenticated, anon;
grant execute on function public.is_manager() to authenticated, anon;
grant execute on function public.can_edit_bookings() to authenticated, anon;

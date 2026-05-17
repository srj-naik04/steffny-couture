-- Migration: 008_shop_manual_bookings
-- Date:      2026-05-17
-- Purpose:   Let staff create bookings directly — the shop dashboard's
--            "new manual booking" flow for walk-in customers (CLAUDE.md §5.1).
--            Migration 003 only has guest and customer INSERT policies; a
--            staff member inserting a booking for someone else matches
--            neither, so the insert is refused.
-- Rollback:  drop the policy.

create policy "bookings_insert_staff"
  on public.bookings for insert
  to authenticated
  with check (public.is_staff());

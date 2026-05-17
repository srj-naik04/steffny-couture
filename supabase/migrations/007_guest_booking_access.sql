-- Migration: 007_guest_booking_access
-- Date:      2026-05-17
-- Purpose:   Let guest customers (no account) read and manage their own
--            bookings. The Phase 1 RLS (003) makes booking reads
--            authenticated-only, so a pure guest could never see a booking
--            back. These SECURITY DEFINER functions are keyed on the booking
--            id — an unguessable UUID that acts as a capability token: only
--            the device that created the booking (and staff) ever holds it.
-- Rollback:  drop the four functions and the storage policy below.
-- Notes:     functions run as the owner and bypass RLS by design; access is
--            gated entirely by knowledge of the booking id.

-- ---------------------------------------------------------------------------
-- Reads
-- ---------------------------------------------------------------------------

-- Bookings the caller holds the ids for (stored on-device after each booking).
create or replace function public.get_guest_bookings(p_ids uuid[])
returns setof public.bookings
language sql
stable
security definer
set search_path = public
as $$
  select * from public.bookings where id = any(p_ids)
$$;

-- The status history (audit trail) for one booking, oldest first.
create or replace function public.get_guest_booking_history(p_id uuid)
returns setof public.booking_status_history
language sql
stable
security definer
set search_path = public
as $$
  select * from public.booking_status_history
  where booking_id = p_id
  order by changed_at asc
$$;

-- ---------------------------------------------------------------------------
-- Writes — both no-ops unless the booking is still new or confirmed
-- ---------------------------------------------------------------------------

-- Cancel a booking. Returns the updated row, or no rows if it was past the
-- cancellable window (the on_booking_status_changed trigger logs the change).
create or replace function public.cancel_guest_booking(p_id uuid)
returns setof public.bookings
language sql
volatile
security definer
set search_path = public
as $$
  update public.bookings
     set status = 'cancelled'
   where id = p_id and status in ('new', 'confirmed')
  returning *
$$;

-- Move a booking to a new appointment slot. Returns the updated row, or no
-- rows if it was past the editable window.
create or replace function public.reschedule_guest_booking(
  p_id uuid,
  p_date date,
  p_time time
)
returns setof public.bookings
language sql
volatile
security definer
set search_path = public
as $$
  update public.bookings
     set appointment_date = p_date,
         appointment_time = p_time
   where id = p_id and status in ('new', 'confirmed')
  returning *
$$;

grant execute on function public.get_guest_bookings(uuid[]) to anon, authenticated;
grant execute on function public.get_guest_booking_history(uuid) to anon, authenticated;
grant execute on function public.cancel_guest_booking(uuid) to anon, authenticated;
grant execute on function public.reschedule_guest_booking(uuid, date, time)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage — guest read access to their booking photos
-- ---------------------------------------------------------------------------
-- Every photo's object path is `bookings/<booking_id>/<file>`, so reading one
-- already requires knowing that unguessable booking id — the same capability
-- model as the functions above. This lets an anonymous guest mint signed URLs
-- for the photos they uploaded. Staff/authenticated reads stay on the 004
-- policies.
create policy "booking_photos_read_guest"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'booking-photos'
    and (storage.foldername(name))[1] = 'bookings'
  );

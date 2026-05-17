-- Migration: 004_storage_buckets
-- Date:      2026-05-17
-- Purpose:   Create the two storage buckets and their access policies.
-- Rollback:  drop the policies; delete the buckets (only when empty).
-- Buckets:   booking-photos (private)  ·  profile-avatars (public read)

-- ---------------------------------------------------------------------------
-- Buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('booking-photos', 'booking-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- booking-photos  — private. Path: bookings/<booking_id>/<file>
-- ---------------------------------------------------------------------------

-- Anyone (incl. guests) can upload into the bookings/ prefix.
create policy "booking_photos_upload"
  on storage.objects for insert
  to authenticated, anon
  with check (
    bucket_id = 'booking-photos'
    and (storage.foldername(name))[1] = 'bookings'
  );

-- Customer reads photos for their own bookings.
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

-- Staff read every booking photo.
create policy "booking_photos_read_staff"
  on storage.objects for select
  using (bucket_id = 'booking-photos' and public.is_staff());

-- Only staff delete booking photos.
create policy "booking_photos_delete_staff"
  on storage.objects for delete
  using (bucket_id = 'booking-photos' and public.is_staff());

-- ---------------------------------------------------------------------------
-- profile-avatars  — public read. Path: <user_id>/<file>
-- ---------------------------------------------------------------------------

-- Avatars are public — anyone can read.
create policy "avatars_read_all"
  on storage.objects for select
  using (bucket_id = 'profile-avatars');

-- Owner writes only into their own <user_id>/ folder.
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

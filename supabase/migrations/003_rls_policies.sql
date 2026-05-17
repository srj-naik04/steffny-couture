-- Migration: 003_rls_policies
-- Date:      2026-05-17
-- Purpose:   Enable Row Level Security and define access policies for every
--            table. This is the security boundary of the app.
-- Rollback:  drop the policies and `alter table ... disable row level security`.
-- Helpers:   uses is_staff() / is_manager() / can_edit_bookings() from 002.

-- ===========================================================================
-- profiles  — user-owned (key is `id`), staff read-all
-- ===========================================================================
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_select_staff"
  on public.profiles for select
  using (public.is_staff());

-- Profiles are created by the handle_new_user() trigger — no INSERT policy.

-- ===========================================================================
-- alteration_types  — reference data: anyone reads, managers mutate
-- ===========================================================================
alter table public.alteration_types enable row level security;

create policy "alteration_types_select_all"
  on public.alteration_types for select
  to authenticated, anon
  using (true);

create policy "alteration_types_insert_manager"
  on public.alteration_types for insert
  with check (public.is_manager());

create policy "alteration_types_update_manager"
  on public.alteration_types for update
  using (public.is_manager())
  with check (public.is_manager());

create policy "alteration_types_delete_manager"
  on public.alteration_types for delete
  using (public.is_manager());

-- ===========================================================================
-- bookings  — business records with a customer reference
-- ===========================================================================
alter table public.bookings enable row level security;

-- Anonymous: create guest bookings (rate-limited via Edge Function later).
create policy "bookings_insert_guest"
  on public.bookings for insert
  to anon
  with check (
    customer_id is null
    and guest_email is not null
    and guest_phone is not null
  );

-- Authenticated customer: create bookings linked to their account or email.
create policy "bookings_insert_customer"
  on public.bookings for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    or (customer_id is null and guest_email = (auth.jwt() ->> 'email'))
  );

-- Customer: read their own bookings (by id or guest email).
create policy "bookings_select_customer"
  on public.bookings for select
  to authenticated
  using (
    customer_id = auth.uid()
    or guest_email = (auth.jwt() ->> 'email')
  );

-- Customer: cancel their own booking (only while new/confirmed).
create policy "bookings_update_customer_cancel"
  on public.bookings for update
  to authenticated
  using (customer_id = auth.uid() and status in ('new', 'confirmed'))
  with check (status = 'cancelled');

-- Staff: full read.
create policy "bookings_select_staff"
  on public.bookings for select
  using (public.is_staff());

-- Tailor / manager: update bookings.
create policy "bookings_update_staff"
  on public.bookings for update
  using (public.can_edit_bookings())
  with check (public.can_edit_bookings());

-- Manager: delete (rare — tailors cancel rather than delete).
create policy "bookings_delete_manager"
  on public.bookings for delete
  using (public.is_manager());

-- ===========================================================================
-- booking_status_history  — append-only audit log
-- ===========================================================================
alter table public.booking_status_history enable row level security;

-- Customer: see history for their own bookings.
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

-- Staff: full read.
create policy "history_select_staff"
  on public.booking_status_history for select
  using (public.is_staff());

-- Rows are written only by the security-definer trigger; block direct writes.
-- (The trigger runs as the table owner and bypasses these policies.)
create policy "history_no_direct_insert"
  on public.booking_status_history for insert
  with check (false);

create policy "history_no_update"
  on public.booking_status_history for update
  using (false);

create policy "history_no_delete"
  on public.booking_status_history for delete
  using (false);

-- ===========================================================================
-- shop_settings  — singleton reference data: anyone reads, managers update
-- ===========================================================================
alter table public.shop_settings enable row level security;

create policy "shop_settings_select_all"
  on public.shop_settings for select
  to authenticated, anon
  using (true);

create policy "shop_settings_update_manager"
  on public.shop_settings for update
  using (public.is_manager())
  with check (public.is_manager());

-- ===========================================================================
-- push_tokens  — user-owned (key is `user_id`)
-- ===========================================================================
alter table public.push_tokens enable row level security;

create policy "push_tokens_select_own"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

create policy "push_tokens_update_own"
  on public.push_tokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

create policy "push_tokens_select_staff"
  on public.push_tokens for select
  using (public.is_staff());

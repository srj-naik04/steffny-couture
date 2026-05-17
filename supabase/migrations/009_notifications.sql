-- Migration: 009_notifications
-- Date:      2026-05-17
-- Purpose:   In-app notifications (CLAUDE.md §6.2). A trigger on the existing
--            booking_status_history audit log turns every booking creation
--            and status change into a notification row — so the customer and
--            shop notification centres need no Edge Function to populate.
-- Rollback:  drop the trigger, function, table and the guest functions.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('customer', 'shop')),
  booking_id uuid references public.bookings (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_audience_idx
  on public.notifications (audience, created_at desc);
create index notifications_booking_id_idx
  on public.notifications (booking_id);

-- ---------------------------------------------------------------------------
-- Trigger — booking_status_history row  ->  notification
-- ---------------------------------------------------------------------------
create or replace function public.notify_on_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings;
  type_label text;
begin
  select * into b from public.bookings where id = new.booking_id;
  if b.id is null then
    return new;
  end if;

  select coalesce(at.label, 'an alteration')
    into type_label
    from public.alteration_types at
   where at.id = b.alteration_type_id;

  if new.from_status is null then
    -- Booking just created — alert the shop.
    insert into public.notifications (audience, booking_id, type, title, body)
    values (
      'shop',
      b.id,
      'booking_created',
      'New booking · ' || b.reference,
      coalesce(b.guest_name, 'A customer') || ' booked ' ||
        coalesce(type_label, 'an alteration') || ' for ' ||
        to_char(b.appointment_date, 'DD Mon')
    );
  else
    -- Status changed — tell the customer.
    insert into public.notifications (audience, booking_id, type, title, body)
    values (
      'customer',
      b.id,
      'status_' || new.to_status,
      case new.to_status
        when 'confirmed' then 'Booking confirmed'
        when 'in_progress' then 'Work has started'
        when 'ready' then 'Your garment is ready'
        when 'collected' then 'Thank you'
        when 'cancelled' then 'Booking cancelled'
        else 'Booking updated'
      end,
      'Booking ' || b.reference || ' — ' ||
      case new.to_status
        when 'confirmed' then 'Steffi has confirmed your appointment.'
        when 'in_progress' then 'Steffi has started work on your garment.'
        when 'ready' then 'Ready to collect from the Hounslow studio.'
        when 'collected' then 'Collected — we hope you love it.'
        when 'cancelled' then 'This booking has been cancelled.'
        else 'The status of your booking has changed.'
      end
    );
  end if;

  return new;
end;
$$;

create trigger on_status_history_notify
  after insert on public.booking_status_history
  for each row execute function public.notify_on_status_change();

-- ---------------------------------------------------------------------------
-- RLS — shop reads directly; customers read via the guest functions below
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "notifications_select_shop"
  on public.notifications for select
  using (audience = 'shop' and public.is_staff());

create policy "notifications_update_shop"
  on public.notifications for update
  using (audience = 'shop' and public.is_staff())
  with check (audience = 'shop' and public.is_staff());

-- Rows are written only by the security-definer trigger.
create policy "notifications_no_insert"
  on public.notifications for insert
  with check (false);

grant select, update on public.notifications to authenticated;

-- ---------------------------------------------------------------------------
-- Guest access — keyed on the booking ids the device remembers (migration 007)
-- ---------------------------------------------------------------------------
create or replace function public.get_guest_notifications(p_booking_ids uuid[])
returns setof public.notifications
language sql
stable
security definer
set search_path = public
as $$
  select * from public.notifications
  where audience = 'customer' and booking_id = any(p_booking_ids)
  order by created_at desc
$$;

create or replace function public.mark_guest_notifications_read(p_booking_ids uuid[])
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.notifications set read_at = now()
  where audience = 'customer'
    and booking_id = any(p_booking_ids)
    and read_at is null
$$;

-- Store an Expo push token for a guest (no profile row to own it).
create or replace function public.register_guest_push_token(
  p_token text,
  p_platform text
)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  insert into public.push_tokens (user_id, token, platform)
  values (null, p_token, p_platform)
  on conflict (token) do nothing
$$;

grant execute on function public.get_guest_notifications(uuid[])
  to anon, authenticated;
grant execute on function public.mark_guest_notifications_read(uuid[])
  to anon, authenticated;
grant execute on function public.register_guest_push_token(text, text)
  to anon, authenticated;

-- Migration: 001_initial_schema
-- Date:      2026-05-17
-- Purpose:   Core schema for the Steffny Couture alterations app — profiles,
--            alteration types, bookings, status history, shop settings and
--            push tokens — with updated_at maintenance, profile auto-creation
--            on signup, and booking status-history logging.
-- Rollback:  drop the six tables (cascade) and the three trigger functions.
-- Note:      RLS is enabled with policies in migration 003. No RLS here.

-- ---------------------------------------------------------------------------
-- Shared trigger functions
-- ---------------------------------------------------------------------------

-- Keeps an updated_at column current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles  — extends auth.users, carries the role
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer'
    check (role in ('customer', 'tailor', 'manager', 'owner', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row automatically whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. alteration_types  — seeded reference data (see migration 005)
-- ---------------------------------------------------------------------------
create table public.alteration_types (
  id text primary key,
  label text not null,
  description text,
  estimated_min_price numeric(10, 2),
  estimated_max_price numeric(10, 2),
  estimated_days int not null default 7,
  icon text,
  sort_order int not null default 0,
  active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- 3. bookings  — the core entity
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null
    default ('SC-' || lpad((floor(random() * 900000 + 100000))::text, 6, '0')),
  customer_id uuid references public.profiles (id) on delete set null,
  -- Guest fields — used when the customer has no account.
  guest_name text,
  guest_phone text,
  guest_email text,
  -- Booking content.
  alteration_type_id text references public.alteration_types (id),
  dress_type text,
  description text not null,
  photo_urls text[] not null default array[]::text[],
  -- Scheduling.
  appointment_date date not null,
  appointment_time time not null,
  -- Status.
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'in_progress', 'ready', 'collected', 'cancelled')),
  -- Pricing.
  price_quote numeric(10, 2),
  deposit_paid numeric(10, 2) not null default 0,
  final_price numeric(10, 2),
  -- Internal.
  internal_notes text,
  -- Audit.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_status_idx on public.bookings (status);
create index bookings_appointment_date_idx on public.bookings (appointment_date);
create index bookings_customer_id_idx on public.bookings (customer_id);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. booking_status_history  — append-only audit log
-- ---------------------------------------------------------------------------
create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now()
);

create index booking_status_history_booking_id_idx
  on public.booking_status_history (booking_id);

-- Logs the initial status on INSERT and every status change on UPDATE.
-- security definer so it can write to an audit table that blocks direct INSERTs.
create or replace function public.log_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.booking_status_history (booking_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, new.customer_id);
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.booking_status_history (booking_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger on_booking_created
  after insert on public.bookings
  for each row execute function public.log_booking_status_change();

create trigger on_booking_status_changed
  after update of status on public.bookings
  for each row execute function public.log_booking_status_change();

-- ---------------------------------------------------------------------------
-- 5. shop_settings  — singleton (id is forced to 1)
-- ---------------------------------------------------------------------------
create table public.shop_settings (
  id int primary key default 1 check (id = 1),
  shop_name text not null default 'Steffny Couture',
  address text not null default '255 High Street, Hounslow, London TW3 1EA',
  whatsapp_number text not null default '+447834877992',
  contact_email text,
  hours jsonb not null default
    '{"mon":["09:30","19:00"],"tue":["09:30","19:00"],"wed":["09:30","19:00"],"thu":["09:30","19:00"],"fri":["09:30","19:00"],"sat":["10:00","19:00"],"sun":["11:00","18:00"]}',
  blocked_dates date[] not null default array[]::date[],
  slot_duration_minutes int not null default 30,
  updated_at timestamptz not null default now()
);

create trigger shop_settings_set_updated_at
  before update on public.shop_settings
  for each row execute function public.set_updated_at();

insert into public.shop_settings (id) values (1);

-- ---------------------------------------------------------------------------
-- 6. push_tokens  — Expo push tokens, one per device
-- ---------------------------------------------------------------------------
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  token text not null unique,
  platform text check (platform in ('ios', 'android')),
  created_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

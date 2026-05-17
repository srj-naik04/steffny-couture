# Steffny Couture Alterations — Master Build Prompt

> **How to use this file:** Save as `CLAUDE.md` in your project root. Claude Code reads it every session and stays consistent on stack, conventions, and scope. For each phase, paste the phase section into Claude Code as a new prompt. Do not skip phases; do not reorder them.

---

## 0. PROJECT CONTEXT

### 0.1 The Business
- **Name:** Steffny Couture Ltd (UK private limited, incorporated 3 Jan 2025)
- **Owner:** Steffi Da Cruz (Instagram: @steffnycouture)
- **Shop:** 255 High Street, Hounslow, London TW3 1EA
- **Phone / WhatsApp:** +44 7834 877992
- **Email:** (to be confirmed — placeholder `bookings@steffnycouture.co.uk`)
- **Existing website:** https://www.steffnycouture.co.uk (Webador, basic catalogue + contact)
- **Hours:** Mon–Fri 09:30–19:00 · Sat 10:00–19:00 · Sun 11:00–18:00
- **Services:** Bespoke evening gowns, wedding dresses, prom dresses, bridesmaid dresses, 21st birthday dresses, and **alterations** to garments brought by customers
- **Price range (ready-to-wear):** £279–£420 · Alterations are bespoke and priced per job

### 0.2 The Problem We're Solving
Steffi currently manages alteration bookings via WhatsApp messages, paper notes, and memory. As volume grows this fails — missed appointments, forgotten requirements, no record of photos, no status visibility for customers. This app replaces that chaos with a single source of truth.

### 0.3 Two User Types
- **Customer** — books an alteration appointment, uploads photos of the garment, describes the change, picks a slot, gets reminders + status updates.
- **Shop (Steffi & future staff)** — sees all bookings, manages workflow (new → in progress → ready → collected), quotes prices, notifies customers, keeps customer history.

### 0.4 Brand Identity (extracted from existing site)
- **Tone:** Elegant, contemporary, premium, handcrafted, London-made
- **Voice:** Warm but refined. "Elegance redefined." "Crafted in London."
- **Feel:** Soft luxury. Not loud, not minimalist-cold. Think *editorial fashion* not *startup SaaS*.
- **References:** Aritzia, Reformation, Reiss app aesthetic — clean serifs, generous whitespace, soft photography.

---

## 1. TECH STACK (FROZEN — do not substitute without permission)

### Use
- **Expo SDK 52+** with **React Native** and **TypeScript** (strict mode)
- **Expo Router v4** (file-based routing)
- **NativeWind v4** (Tailwind for RN)
- **react-native-reusables** (shadcn ports for RN)
- **React Native Reanimated 3** + **Moti** (animations)
- **React Native Gesture Handler**
- **Expo Haptics**, **Expo Image**, **Expo Notifications**, **Expo File System**, **Expo Image Picker**, **Expo Document Picker**
- **Lucide React Native** (icons)
- **Zustand** (client state) + **TanStack Query v5** (server state)
- **React Hook Form** + **Zod** (forms + validation)
- **date-fns** + **date-fns-tz** (dates, locked to Europe/London)
- **@react-native-community/datetimepicker** (native pickers)
- **Supabase** — Postgres, Auth, Storage, Realtime, Edge Functions
- **Nodemailer** (via Supabase Edge Function in Deno using `npm:nodemailer`)
- **react-email** (email templates as React components)
- **MMKV** via `react-native-mmkv` (fast local storage)
- **Sentry** (free tier, optional in Phase 9)

### Do NOT use
- ❌ `StyleSheet.create` — use NativeWind classes only
- ❌ Inline styles for layout — use NativeWind
- ❌ Direct imports from `react-native` in screen files — always go through `/components`
- ❌ AsyncStorage — use MMKV
- ❌ Firebase, OneSignal, Twilio — Expo Push + Nodemailer + WhatsApp deep links cover everything for free
- ❌ Native modules requiring `expo prebuild` unless absolutely necessary (kills Expo Go demo flow)
- ❌ Class components, Redux, MobX, GraphQL — keep it simple
- ❌ `any` in TypeScript — use `unknown` and narrow

---

## 2. ARCHITECTURE PRINCIPLES (NON-NEGOTIABLE)

### 2.1 The "No Rework For Web Later" Rules
We will deliver iOS first. Android is the same codebase. **A future web version must require zero screen rewrites.** To guarantee this:

1. **Never import from `react-native` directly in `/app/*` screens.** Always import from `/components/ui/*`. Component internals can branch by platform later; screens cannot.
2. **All business logic lives in `/features/<feature>/hooks/*` or `/features/<feature>/api/*` as pure TypeScript.** These files must work identically on web with zero changes.
3. **Style only with NativeWind `className` props.** No `StyleSheet`, no inline `style={{...}}` for visual styling. Layout-only inline styles (e.g. dynamic widths from props) are acceptable but rare.
4. **All navigation via Expo Router `<Link>` and `router.push()`.** Never `navigation.navigate()`. Expo Router works on web identically.
5. **Use platform-agnostic primitives:** `View`, `Text`, `Pressable`, `ScrollView`, `FlatList` — wrapped once in `/components/ui/`.
6. **Touch targets ≥ 44pt.** Web hover states added later won't affect mobile.

### 2.2 Folder Structure
```
/app                          # Expo Router screens
  /(customer)                 # Customer route group
    _layout.tsx
    index.tsx                 # Welcome / home
    book/
      _layout.tsx             # Wizard layout
      type.tsx                # Step 1
      photos.tsx              # Step 2
      details.tsx             # Step 3
      schedule.tsx            # Step 4
      contact.tsx             # Step 5
      review.tsx              # Step 6
      confirmed.tsx           # Success
    bookings/
      index.tsx               # List
      [id].tsx                # Detail
  /(shop)                     # Shop route group (auth-gated)
    _layout.tsx
    index.tsx                 # Dashboard / Today
    bookings/
      index.tsx               # List + kanban
      [id].tsx                # Detail + actions
    customers/
      index.tsx
      [id].tsx
    calendar.tsx
    settings.tsx
  /(auth)
    login.tsx
    reset.tsx
  _layout.tsx                 # Root layout (providers)
  +not-found.tsx

/components
  /ui                         # Primitives (Button, Input, Card, Sheet, Dialog, Toast, Skeleton, EmptyState, Badge, Avatar, Chip, ProgressBar, BottomSheet, DatePicker, TimePicker, PhotoUploader, StatusPill)
  /forms                      # Composite form fields
  /booking                    # Booking-specific (BookingCard, StatusTimeline, PriceQuoteBox)
  /shop                       # Shop-specific (KanbanColumn, TodayList, CustomerRow)
  /motion                     # Reusable animated wrappers (FadeInView, StaggeredList, PressableScale)

/features
  /bookings
    /api                      # Supabase queries + mutations
    /hooks                    # useBookings, useCreateBooking, useUpdateBookingStatus, etc.
    /schemas                  # Zod schemas
    /types                    # TS types (mirror DB)
  /auth
  /customers
  /notifications
  /settings

/lib
  supabase.ts                 # Client init
  storage.ts                  # MMKV wrapper
  whatsapp.ts                 # wa.me deep link helper
  haptics.ts                  # Wrapped Expo Haptics
  date.ts                     # date-fns helpers locked to Europe/London
  format.ts                   # Currency (£), phone, etc.
  env.ts                      # Typed env access
  query-client.ts             # TanStack Query config

/constants
  brand.ts                    # Colours, fonts, spacing as TS constants (mirror tailwind.config)
  alteration-types.ts         # Hem, Take in, Sleeves, etc.
  shop.ts                     # Hours, contact, address

/types                        # Global TS types
  database.ts                 # Generated from Supabase

/emails                       # react-email templates (rendered server-side)
  BookingConfirmation.tsx
  BookingStatusUpdate.tsx
  DressReadyNotification.tsx
  InternalNewBookingAlert.tsx
  AppointmentReminder.tsx

/supabase
  /functions
    /send-email
      index.ts                # Deno + Nodemailer
    /send-push
      index.ts
  /migrations
    *.sql

/assets
  /images
  /fonts
  icon.png
  splash.png
  adaptive-icon.png
```

### 2.3 Code Conventions
- **File naming:** `kebab-case.tsx` for components, `camelCase.ts` for utilities, `PascalCase` for component exports.
- **Imports:** absolute paths via `@/` (configure in `tsconfig.json` and `babel.config.js`).
- **Components:** function components, named exports. One component per file (sub-components inline if tiny and only used here).
- **Props:** define inline type `type Props = { ... }`, no `React.FC`.
- **Comments:** explain *why*, not *what*. Code should self-document the *what*.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- **Branches:** `main` (production), `develop` (default), `feat/<name>`, `fix/<name>`.

---

## 3. DESIGN SYSTEM

### 3.1 Colour Palette
Inspired by the site's *"Elegance redefined / Crafted in London"* positioning. Warm neutral base, deep rose accent, champagne highlight.

```ts
// constants/brand.ts
export const colors = {
  // Backgrounds
  ivory:        '#FAF7F2',  // app background — warm cream
  surface:      '#FFFFFF',  // cards
  surfaceAlt:   '#F4EFE8',  // raised sections, input backgrounds

  // Brand
  rose:         '#7C2D3E',  // primary — deep burgundy rose (buttons, headers)
  roseDark:     '#5A1F2C',  // pressed state
  roseSoft:     '#F2D9DE',  // tonal backgrounds, status pills
  gold:         '#C9A961',  // secondary accent — champagne (highlights, badges)
  goldSoft:     '#F5EBD2',  // tonal

  // Text
  ink:          '#1F1B1A',  // primary text
  inkMuted:     '#5C5551',  // secondary text
  inkSubtle:    '#9A9089',  // tertiary text, hints

  // Functional
  success:      '#3F6E4A',  // muted forest green
  warning:      '#B8741A',  // amber
  danger:       '#9B2C2C',  // muted red
  info:         '#3A5878',  // muted blue

  // Borders
  border:       '#E8E0D7',
  borderStrong: '#D4C8BA',
} as const;
```

Configure in `tailwind.config.js` so classes like `bg-rose`, `text-ink`, `border-border` work.

### 3.2 Typography
Two Google Fonts, loaded via `expo-google-fonts`:

- **Display / Headings:** `Fraunces` (700 / 600) — warm modern serif, couture feel
- **Body / UI:** `Inter` (400 / 500 / 600)

```ts
export const typography = {
  display: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
};
```

Scale (line-height in parens):
- `text-3xl` 32 (40) — Page headers
- `text-2xl` 26 (34) — Section headers
- `text-xl` 22 (30) — Card titles
- `text-lg` 18 (26) — Emphasised body
- `text-base` 16 (24) — Default body
- `text-sm` 14 (20) — Secondary
- `text-xs` 12 (16) — Captions

### 3.3 Spacing & Radius
- Use Tailwind's spacing scale strictly. No magic numbers.
- **Screen padding:** `px-5` (20px) standard, `px-6` (24px) for prominent screens
- **Card radius:** `rounded-2xl` (16px)
- **Button radius:** `rounded-full` for primary CTAs, `rounded-xl` for secondary
- **Input radius:** `rounded-xl`
- **Sheet/modal radius:** `rounded-t-3xl` (24px top)

### 3.4 Elevation
- **Card:** subtle `shadow-sm` + 1px `border-border`
- **Floating action / Sheet:** larger `shadow-lg`
- Always pair shadow with a 1px border in the same hue family — pure shadows on white look generic.

### 3.5 Motion Principles
Animations sell the product. Every interaction must feel **intentional, never gratuitous.**

- **Durations:** 200ms (micro), 300ms (default), 500ms (page transitions)
- **Easing:** `Easing.out(Easing.cubic)` default; spring (`damping: 18, stiffness: 180`) for delightful moments
- **Page transitions:** iOS slide for customer flow; modal sheet (`presentation: 'modal'`) for booking wizard
- **List entrance:** stagger using Reanimated `Layout.springify()` with 40ms delay between items
- **Press feedback:** `PressableScale` wrapper scales to 0.97 with spring on press; haptic `Selection` fires on press-in
- **Success moments:** check-mark draws on (SVG stroke animation) + `Notification.Success` haptic + brief confetti is too much — instead, a subtle radial glow expanding from the check
- **Loading:** skeletons (shimmer via Reanimated), never spinners except for inline button states
- **Error toasts:** slide down from top, `Notification.Error` haptic
- **Never animate just because.** If a motion doesn't communicate *something has changed* or *acknowledge an action*, remove it.

### 3.6 Haptics Policy
Wrap Expo Haptics in `/lib/haptics.ts`. Use them like seasoning:

- `selection()` — every button press-in
- `light()` — toggle, tab switch
- `medium()` — confirming a step (e.g. "Next" in wizard)
- `success()` — booking submitted, status updated
- `warning()` — destructive confirm
- `error()` — failed action
- Respect OS-level reduce-motion / haptic settings.

### 3.7 Accessibility
- Every interactive element has `accessibilityLabel` and `accessibilityRole`
- Minimum touch target 44×44pt
- Colour contrast ≥ AA (4.5:1 for body text)
- Screen-reader order matches visual order
- Form fields have visible labels (never placeholder-as-label)
- All animations respect `useReducedMotion()` hook

---

# PHASE 0 — Project Foundation

**Goal:** Working Expo project with all dependencies, design system wired, Supabase connected, deployable to Expo Go.

### Tasks
1. Run `npx create-expo-app@latest steffny-couture-app -t expo-template-blank-typescript`
2. Install all dependencies from §1 (paste full list — use `npx expo install` for Expo-managed packages)
3. Configure **NativeWind v4** per its docs (Babel plugin, `metro.config.js`, `global.css`, `nativewind-env.d.ts`)
4. Configure **Reanimated** Babel plugin
5. Configure **Expo Router**: set entry point in `package.json` to `expo-router/entry`
6. Configure path alias `@/*` in `tsconfig.json` and `babel.config.js`
7. Set TypeScript to `strict: true`, `noUncheckedIndexedAccess: true`
8. Create `tailwind.config.js` with brand colours from §3.1 and font families from §3.2
9. Load Google Fonts via `expo-font` + `@expo-google-fonts/fraunces` + `@expo-google-fonts/inter` in root `_layout.tsx` with a `SplashScreen` hold until ready
10. Create `/constants/brand.ts`, `/constants/shop.ts`, `/constants/alteration-types.ts` with values from §0.1 and §3
11. Create `/lib/supabase.ts` — typed client with URL + anon key from `process.env.EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY`
12. Create `/lib/env.ts` with Zod-validated env access (throws on boot if any required var missing)
13. Create `/lib/haptics.ts`, `/lib/whatsapp.ts`, `/lib/date.ts`, `/lib/format.ts` per §3.6 and lib conventions
14. Create empty folder structure per §2.2
15. Set up `eslint`, `prettier`, `typescript-eslint`, `eslint-plugin-tailwindcss`. Add `lint`, `typecheck`, `format` scripts
16. Initialise git, commit
17. Create Supabase project (free tier, region `eu-west-2` London). Save URL + anon key to `.env.local` (gitignored)
18. Verify: `npx expo start` → press `i` (iOS sim) AND scan QR with Expo Go on a real phone — shows a placeholder screen with `Hello, Steffny Couture` rendered in Fraunces over ivory background

### Acceptance Criteria
- [ ] App boots in Expo Go on physical iPhone
- [ ] Fonts load before splash dismisses
- [ ] `npm run typecheck` clean
- [ ] `npm run lint` clean
- [ ] Brand colour tokens accessible via Tailwind classes
- [ ] Supabase client can `select 1` without error

---

# PHASE 1 — Database, Storage, Edge Functions, Email

**Goal:** Backend fully operational. App can read/write bookings, upload photos, and trigger emails via Edge Function.

### 1.1 Database Schema
Create SQL migration in `/supabase/migrations/001_initial.sql`. All tables in `public` schema. Use `uuid` PKs (`gen_random_uuid()`), `created_at timestamptz default now()`, `updated_at` with trigger.

**Tables:**

```sql
-- 1. profiles (extends auth.users; created via trigger on user signup)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'shop', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. alteration_types (seeded reference data)
create table public.alteration_types (
  id text primary key,                    -- 'hem', 'take_in', 'sleeves', etc.
  label text not null,                    -- 'Hem'
  description text,
  estimated_min_price numeric(10,2),
  estimated_max_price numeric(10,2),
  estimated_days int default 7,
  icon text,                              -- Lucide icon name
  sort_order int default 0,
  active boolean default true
);

-- 3. bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('SC-' || lpad((floor(random()*900000+100000))::text, 6, '0')),
  customer_id uuid references public.profiles(id) on delete set null,
  -- Guest fields (used when customer has no account)
  guest_name text,
  guest_phone text,
  guest_email text,
  -- Booking content
  alteration_type_id text references public.alteration_types(id),
  dress_type text,                        -- 'wedding', 'prom', 'evening', etc.
  description text not null,
  photo_urls text[] default array[]::text[],
  -- Scheduling
  appointment_date date not null,
  appointment_time time not null,
  -- Status
  status text not null default 'new' check (status in ('new','confirmed','in_progress','ready','collected','cancelled')),
  -- Pricing
  price_quote numeric(10,2),
  deposit_paid numeric(10,2) default 0,
  final_price numeric(10,2),
  -- Internal
  internal_notes text,
  -- Audit
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on public.bookings (status);
create index on public.bookings (appointment_date);
create index on public.bookings (customer_id);

-- 4. booking_status_history
create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz default now()
);
create index on public.booking_status_history (booking_id);

-- 5. shop_settings (singleton — enforce single row via check + trigger)
create table public.shop_settings (
  id int primary key default 1 check (id = 1),
  shop_name text default 'Steffny Couture',
  address text default '255 High Street, Hounslow, London TW3 1EA',
  whatsapp_number text default '+447834877992',
  contact_email text,
  hours jsonb default '{"mon":["09:30","19:00"],"tue":["09:30","19:00"],"wed":["09:30","19:00"],"thu":["09:30","19:00"],"fri":["09:30","19:00"],"sat":["10:00","19:00"],"sun":["11:00","18:00"]}',
  blocked_dates date[] default array[]::date[],
  slot_duration_minutes int default 30,
  updated_at timestamptz default now()
);
insert into public.shop_settings (id) values (1);

-- 6. push_tokens (for Expo Push)
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text check (platform in ('ios','android')),
  created_at timestamptz default now()
);
```

**Triggers:**
- `updated_at` auto-update on `bookings`, `profiles`, `shop_settings`
- `on auth.users insert` → create matching `profiles` row
- `on bookings update of status` → insert into `booking_status_history` + invoke Edge Function `send-email` (via `pg_net` HTTP call)

### 1.2 RLS Policies
Enable RLS on all tables. Critical policies:

- `profiles`: user can `select`/`update` own row. Shop role can `select` all.
- `bookings`:
  - Anonymous users can `insert` (for guest bookings) **only with rate limiting** — add a Supabase Edge Function gate for production; in dev allow it directly
  - Customer can `select` rows where `customer_id = auth.uid()` OR `guest_email = (auth.jwt() ->> 'email')`
  - Shop role can `select`, `update`, `delete` everything
- `booking_status_history`: customer can `select` for their own bookings; shop can do everything
- `shop_settings`: anyone can `select`; only shop role can `update`
- `push_tokens`: user can manage own tokens

### 1.3 Storage Buckets
- `booking-photos` — **private**. RLS: customer can upload to `bookings/{booking_id}/...` if booking belongs to them or matches their guest email. Shop can read all.
- `profile-avatars` — public read, owner write.

### 1.4 Seed Data
- Insert ~8 `alteration_types`: Hem, Take In, Take Out, Sleeves, Bodice, Zipper Replacement, Embellishment, Other. Each with realistic price ranges (£15–£120 typical for alterations) and icons (`scissors`, `ruler`, `shirt`, `zap`, etc.)
- Insert a `shop` user via Supabase Auth with email like `steffi@steffnycouture.co.uk` and a temp password to share securely; set `role = 'shop'` on their profile.

### 1.5 Edge Function: `send-email`
Path: `/supabase/functions/send-email/index.ts`. Deno runtime.

- Imports: `import nodemailer from "npm:nodemailer@6.9.16"` and `import { render } from "npm:@react-email/render"`
- Inputs (body): `{ type: 'booking_confirmation' | 'status_update' | 'dress_ready' | 'internal_alert', booking_id: string }`
- Steps:
  1. Verify caller (service role key or signed JWT)
  2. Fetch booking + customer from Supabase
  3. Select template, render to HTML
  4. Connect via Nodemailer using SMTP creds from `Deno.env`:
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`
  5. Send email; include plaintext fallback
  6. Return `{ ok: true, message_id }` or error
- For dev: use a Gmail app password on a dedicated test account
- For prod: use her domain's SMTP

### 1.6 Email Templates (react-email)
Five templates in `/emails/`, each a React component receiving typed props. Render is done in the Edge Function (so we don't ship react-email in the mobile bundle). Each template:
- Uses brand colours
- Header with Steffny Couture logotype (Fraunces)
- Clear hero message
- Booking ref, appointment date/time, alteration summary
- WhatsApp CTA + phone link
- Footer: address, hours, unsubscribe (later)

### Acceptance Criteria
- [ ] All tables created with RLS enabled
- [ ] Inserting a booking from the Supabase dashboard auto-creates a history row
- [ ] Triggering `send-email` Edge Function with a test booking ID delivers an email to a real inbox
- [ ] Storage upload from the dashboard works, RLS prevents wrong-user access
- [ ] Generated TypeScript types (`npx supabase gen types typescript --local`) sync to `/types/database.ts`

---

# PHASE 2 — Authentication

**Goal:** Shop user can log in; customer flow supports both guest bookings and optional accounts.

### Tasks
1. **Sign-in screen** (`/app/(auth)/login.tsx`) — email + password, branded, with "Forgot password" link. Used by shop staff.
2. **Password reset** flow — email magic link, set new password.
3. **Auth provider** wrapping the app — listens to `supabase.auth.onAuthStateChange`, exposes `useAuth()` hook returning `{ session, profile, isLoading }`.
4. **Role-based routing in root `_layout.tsx`:**
   - No session OR `role === 'customer'` → render `(customer)` group
   - `role === 'shop'` or `'admin'` → render `(shop)` group
   - Show a "Switch to customer view" debug button only in `__DEV__`
5. **Guest booking support** — customer flow does not require login in v1. Optionally at the end: "Save your details for next time" → magic-link signup.
6. **Persist session** in MMKV via Supabase's custom storage adapter (don't use AsyncStorage).

### Acceptance Criteria
- [ ] Shop login routes to shop dashboard
- [ ] No login defaults to customer welcome
- [ ] Session survives app restart
- [ ] Password reset email arrives and works

---

# PHASE 3 — Customer Booking Flow

**Goal:** A customer can complete an alteration booking in under 90 seconds with delight.

### 3.1 Welcome Screen (`/app/(customer)/index.tsx`)
- Hero: large Fraunces headline "Alterations, perfected." + sub "Book a fitting at our Hounslow studio." 
- Hero image: a generic dress photo (placeholder — Steffi to send later)
- Primary CTA: "Book an alteration" → routes to `/book/type`
- Secondary CTA: "My bookings" → `/bookings`
- Tertiary row: address pill + phone pill + Instagram pill (tappable: opens Maps / dialer / Instagram)
- Bottom: hours card with today's hours highlighted

### 3.2 The Wizard (6 steps)
Layout: `/app/(customer)/book/_layout.tsx` defines a stack with:
- Modal presentation
- Progress bar at top showing `currentStep / 6`
- Back button (chevron left), close button (X — confirms with sheet if mid-flow)
- Smooth slide transitions between steps

**Step 1 — Alteration Type** (`type.tsx`)
- Title: "What needs altering?"
- Grid of cards (2 cols on phone), each: icon + label + tiny price-range chip
- Tap → haptic `selection` → next
- Validation: must pick one

**Step 2 — Photos** (`photos.tsx`)
- Title: "Add photos of the garment"
- Subtitle: "Front, back, and the area to alter. Up to 5 photos."
- Photo grid: 1–5 thumbnails + "Add" tile
- Add tile → action sheet: "Take photo" / "Choose from library" (uses Expo Image Picker)
- Each thumbnail: tap to view full, long-press to delete (haptic `warning` + confirm)
- Upload happens **in background to Supabase Storage** as soon as a photo is picked — show subtle progress ring per thumbnail
- Validation: at least 1 photo

**Step 3 — Details** (`details.tsx`)
- Garment type dropdown (Wedding, Prom, Evening, Bridesmaid, 21st Birthday, Casual, Other)
- Description textarea: "Describe what you'd like done." (placeholder copy: e.g., "Take in the waist by an inch, shorten hem to ankle.")
- Optional: brand of garment, when needed by date
- Validation: description ≥ 10 chars

**Step 4 — Schedule** (`schedule.tsx`)
- Date picker (horizontal scrollable week-strip + "See full calendar" → modal month view)
- Disable past dates, Sundays past 18:00, and `blocked_dates` from `shop_settings`
- Time slots below selected date — chips for available slots based on `slot_duration_minutes` and shop hours
- Show booked slots greyed out (query `bookings` for that date)
- Validation: must pick both

**Step 5 — Contact** (`contact.tsx`)
- Name, phone (auto-format UK), email
- If user is logged in, pre-fill from profile
- Toggle: "Save my details for next time" (creates account via magic link after submission)
- Validation: name ≥ 2, valid UK phone, valid email

**Step 6 — Review** (`review.tsx`)
- Summary card with edit chips per section (tap → jumps back to that step)
- Big CTA: "Confirm booking"
- Fine print: "We'll send a confirmation. Steffi will reply with a price quote within 24 hours."
- Submit:
  1. Optimistic UI: show success screen immediately
  2. POST booking to Supabase
  3. On success → keep success screen, fire `send-email` for `booking_confirmation` + `internal_alert`
  4. On failure → toast error, undo optimistic state

**Confirmed Screen** (`confirmed.tsx`)
- Big success check (animated)
- "You're booked." with reference number (e.g. `SC-482917`)
- Card with appointment summary
- CTAs:
  - "Open in WhatsApp" → `wa.me/447834877992?text=Hi%20Steffi%2C%20re%3A%20booking%20SC-482917`
  - "Add to calendar" → uses Expo Calendar
  - "Done" → back to home
- Auto-dismiss progress bar; this is no longer "step 7"

### 3.3 Form State
- Use **React Hook Form** with a single Zod schema for the whole wizard.
- State persists in **Zustand store** across steps so back-navigation preserves entries.
- On wizard close mid-flow → confirm sheet "Discard booking?" with haptic warning.

### Acceptance Criteria
- [ ] Wizard completes end-to-end on physical device
- [ ] Photos visible in Supabase Storage with correct path
- [ ] Booking row created with all fields
- [ ] Confirmation email arrives
- [ ] Reference number shown in app matches DB
- [ ] Back-navigation never loses data
- [ ] Closing mid-flow prompts confirmation

---

# PHASE 4 — Customer "My Bookings"

**Goal:** Customer can see status of their bookings and contact the shop.

### Tasks
1. **List** (`/bookings/index.tsx`)
   - Query: bookings where `customer_id = auth.uid()` OR `guest_email = stored_email_in_mmkv`
   - Section by status: "Active" (new/confirmed/in_progress/ready) vs "Past" (collected/cancelled)
   - `BookingCard` shows: ref, alteration type icon + label, appointment date/time, `StatusPill`
   - Empty state: illustration + "No bookings yet" + CTA "Book your first alteration"
2. **Detail** (`/bookings/[id].tsx`)
   - Hero: status pill + reference
   - `StatusTimeline` — visual progression of statuses with timestamps and notes
   - Appointment card
   - Photo gallery (tap → full-screen viewer with pinch zoom)
   - Description, price quote (if set), final price (if set)
   - CTAs: "Message Steffi" (WhatsApp), "Call", "Reschedule" (opens schedule step again), "Cancel" (confirms, sets `status='cancelled'`)
3. **Realtime**: subscribe to changes on this booking so status updates appear live.

### Acceptance Criteria
- [ ] List filters work
- [ ] Status timeline accurate
- [ ] Realtime update visible when shop changes status
- [ ] WhatsApp deep link opens with prefilled message

---

# PHASE 5 — Shop Dashboard

**Goal:** Steffi can run her day from her phone.

### 5.1 Today (`/app/(shop)/index.tsx`)
- Top: greeting + date
- KPI strip: "Today's appointments", "Awaiting collection", "New this week"
- "Today" list: bookings with `appointment_date = today`, sorted by time, each with quick-action buttons (mark started, message)
- "Needs attention": new bookings without a price quote
- Floating action button: "+" → "New manual booking" (for walk-ins)

### 5.2 Bookings (`/app/(shop)/bookings/index.tsx`)
- Tab switcher: **List** | **Kanban** | **Calendar**
- List: filterable by status, date range, search (ref, customer name, phone, description)
- Kanban: horizontal swipeable columns (New / Confirmed / In Progress / Ready / Collected). Drag-and-drop status changes (Reanimated + Gesture Handler). Haptic `medium` on column change.
- Calendar: month view with dots per day; tap day → bottom sheet with that day's bookings

### 5.3 Booking Detail (`/app/(shop)/bookings/[id].tsx`)
- Everything the customer sees, plus:
  - Price quote field (editable inline, saves on blur)
  - Internal notes (multiline, only visible to shop)
  - Final price field
  - **Status update row** — buttons for the next-step status, each fires its own email template:
    - "Confirm" → status=confirmed, sends `status_update`
    - "Start work" → in_progress
    - "Mark ready" → ready, sends `dress_ready` email + push
    - "Mark collected" → collected
    - "Cancel" → confirm sheet → cancelled
  - Quick contact bar: WhatsApp / Call / Email customer
  - Audit trail: full `booking_status_history` with who/when/note

### 5.4 Customers (`/app/(shop)/customers/index.tsx`)
- List of unique customers (aggregated from bookings — by phone/email)
- Detail: contact info + full history of bookings + total spend

### 5.5 Settings (`/app/(shop)/settings.tsx`)
- Edit shop hours (per-day time pickers)
- Manage blocked dates (calendar multi-select)
- Manage alteration types (CRUD: label, prices, days, icon)
- Notification preferences
- Slot duration
- Log out

### Acceptance Criteria
- [ ] All views work on iPhone SE-size screen without horizontal scroll
- [ ] Kanban drag updates DB and reverts on failure
- [ ] Status buttons fire correct emails
- [ ] Search returns results within 300ms on a 100-booking dataset
- [ ] Calendar correctly highlights days with bookings

---

# PHASE 6 — Notifications

**Goal:** Customers know what's happening without opening the app.

### Tasks
1. **Expo Push Notifications**
   - Request permission on first relevant action (e.g., after first booking) — don't blast on app open
   - Store device token in `push_tokens` table on grant
   - Edge Function `send-push` reads tokens and POSTs to Expo Push API
   - Server triggers (DB trigger on `bookings.status update`) call `send-push` for relevant statuses
2. **In-app notification center** — `/(customer)/notifications` and shop-side equivalent. Reads from a `notifications` table populated alongside push sends.
3. **Email sequence** — wired in Phase 1, just verify all 5 templates actually trigger in correct lifecycle:
   - Booking created → `booking_confirmation` to customer + `internal_alert` to Steffi
   - Status → ready → `dress_ready` to customer
   - Status → confirmed/in_progress/cancelled → `status_update`
   - 24h before appointment → `appointment_reminder` (Supabase cron job or scheduled Edge Function)
4. **WhatsApp deep links** — `/lib/whatsapp.ts` exposes `getWhatsAppLink(booking, message?)` used everywhere a contact action appears.

### Acceptance Criteria
- [ ] Push received on real device when status changes
- [ ] Email arrives within 30s
- [ ] In-app badge count accurate
- [ ] No spam: permission requested at the right moment

---

# PHASE 7 — UI Polish (User Friendliness Pass)

**Goal:** Demo-grade quality. Every screen feels considered.

### Universal Polish Checklist (apply to every screen)
- [ ] **Skeleton loading state** (not spinner) for first-paint
- [ ] **Empty state** with illustration + helpful copy + CTA
- [ ] **Error state** recoverable — "Something went wrong. [Try again]"
- [ ] **Pull-to-refresh** on every list
- [ ] **Optimistic updates** for status changes, photo uploads
- [ ] **Toast** for non-blocking feedback (success, info)
- [ ] **Bottom sheet** for confirms (cancel, delete) — never iOS Alert
- [ ] **Keyboard handling** — `KeyboardAvoidingView` + smooth scroll-to-focused-field
- [ ] **Safe area** respected (top notch, bottom home indicator)
- [ ] **Offline banner** when `NetInfo` disconnected; queue mutations via TanStack Query persistence
- [ ] **Press states** via `PressableScale`
- [ ] **Haptics** per §3.6
- [ ] **Accessibility labels** per §3.7
- [ ] **Reduced motion** respected
- [ ] **Status bar** colour matches screen background

### Animation Polish
- [ ] Wizard step transitions: 320ms slide with shared progress bar
- [ ] Status pill colour transition: 240ms cross-fade
- [ ] Photo upload thumbnail: spring-scale in
- [ ] Success check: SVG stroke-dasharray draw-on (400ms) + radial glow
- [ ] List items: staggered fade+rise with `Layout.springify()`
- [ ] FAB: scale+rotate on press; subtle bounce on appear
- [ ] Kanban drag: card lifts (shadow + scale 1.03) + receiving column highlights

### Copy Polish
- All UI copy reviewed for tone: warm, confident, brief. No exclamation marks. No "Oops!". Errors are clear without being apologetic.
- Currency: always £ with two decimals (`£42.00`)
- Dates: "Wed 21 May" (short) / "Wednesday, 21 May 2026" (long). Times: "2:30 PM"
- Phone: "+44 7834 877992" format
- All address mentions match exactly: "255 High Street, Hounslow, London TW3 1EA"

### Acceptance Criteria
- [ ] Hand the app to someone who's never used it — they complete a booking without questions
- [ ] No screen has a spinner-as-only-loading-state
- [ ] No empty state is blank
- [ ] No error dead-ends the user

---

# PHASE 8 — Demo Preparation

**Goal:** A demo Bunty can install and click through, with seed data that looks real.

### Tasks
1. **Branding assets**
   - App icon: Steffny Couture monogram on rose background (1024×1024)
   - Adaptive icon for Android
   - Splash: ivory background, Fraunces "Steffny Couture" centred, rose accent line below
   - Update `app.json` with `name`, `slug`, `scheme: 'steffnycouture'`, `ios.bundleIdentifier: 'uk.co.steffnycouture.app'`, `android.package: 'uk.co.steffnycouture.app'`
2. **Seed script** — `/scripts/seed.ts` creates:
   - 1 shop user
   - 15 fake bookings spread across statuses, dates, alteration types
   - Realistic British names (Emily, Aisha, Priya, Chloe, Riya, Hannah, etc.)
   - 2–3 photos per booking from a curated free stock set
   - Price quotes on some, internal notes on a few
3. **Demo data wipe + reseed** script so you can reset between demos
4. **Demo script** — a printed/notes-app checklist for what to walk Bunty through:
   1. Open app on phone in customer mode → book "Hem" alteration end-to-end (45 sec)
   2. Receive confirmation email live on screen
   3. Switch to shop view → show today, find the new booking
   4. Tap booking → set price quote → "Mark in progress" → "Mark ready"
   5. Switch back to customer view → show status update arrived as push
   6. Show calendar, kanban, customer history
5. **Distribution for demo**
   - **Primary path:** Expo Go — send Bunty an `exp://` link, he installs Expo Go from App Store
   - **Polished path:** EAS Build → internal distribution → TestFlight invite to his Apple ID

### Acceptance Criteria
- [ ] App icon + splash visible in Expo Go preview
- [ ] Seed data looks like a real shop's data
- [ ] Demo script completes in under 4 minutes
- [ ] Two demo paths both work

---

# PHASE 9 — Production Deployment (only after client approval)

**Goal:** Ship to App Store and Play Store under Steffny Couture's accounts.

### Tasks
1. Create Apple Developer account ($99/year) — **client pays Apple directly**; account in Steffi's name
2. Create Google Play Console account ($25 one-time) — same principle
3. Configure EAS: `eas.json` with `production` profile, app store credentials
4. App Store Connect: create app entry, fill metadata, screenshots (use Fastlane or Expo's screenshot tool), privacy policy URL, support URL
5. Google Play: same plus content rating questionnaire
6. **Privacy Policy + Terms** — generate via a service like Termly, host on `steffnycouture.co.uk/privacy` and `/terms`. Cover: data collected (name, phone, email, photos), how stored (Supabase EU), how shared (none), retention, contact for deletion
7. Production env vars: prod Supabase project, prod SMTP, EAS secrets
8. First builds: `eas build --profile production --platform ios` and `--platform android`
9. Submit for review. iOS typically 24–48 hours.
10. Post-launch: Sentry, monitor first bookings, hotfix if anything

### Optional: Web Version
Run `npx expo export --platform web && vercel deploy`. Deploy to a subdomain like `app.steffnycouture.co.uk`. Test all flows. Add web-specific polish (hover states, larger layouts) only where needed.

---

# APPENDIX A — Component Inventory

Build these once in `/components/ui/`, use everywhere. Each must be platform-agnostic, NativeWind-styled, fully typed.

| Component | Notes |
|---|---|
| `Button` | Variants: primary, secondary, ghost, destructive. Sizes: sm/md/lg. Loading state. Left/right icon slots. |
| `IconButton` | Square, accessible label required |
| `Input` | Label, helper text, error state, prefix/suffix |
| `Textarea` | Auto-grow, char counter |
| `Select` | Native picker on iOS, bottom sheet on Android |
| `DatePicker` | Wraps native; outputs ISO date |
| `TimePicker` | Same pattern |
| `Card` | Surface + border + radius; pressable variant with scale |
| `Sheet` | Bottom sheet with snap points |
| `Dialog` | Centre modal for confirms |
| `Toast` | Stacked, auto-dismiss, swipe to dismiss |
| `Badge` | Status pills with colour map |
| `Avatar` | Initials fallback, image with caching |
| `Chip` | Selectable, with icon |
| `ProgressBar` | Animated width |
| `Skeleton` | Shimmer pulse |
| `EmptyState` | Illustration + title + body + CTA |
| `PhotoUploader` | Multi-photo with progress, reorder, delete |
| `StatusPill` | Booking status → colour + label |
| `StatusTimeline` | Vertical with dots, animated |
| `KanbanBoard` | Horizontal columns with drag-and-drop |
| `KpiTile` | Number + label + delta |
| `PressableScale` | Wraps Pressable with spring scale + haptic |
| `FadeInView` | Reanimated FadeIn wrapper |
| `StaggeredList` | Wraps FlatList children with staggered animations |

---

# APPENDIX B — Done Criteria (Definition of Demo-Ready)

The build is "demo-ready" when:

1. A new person, given only the app on their phone, can book an alteration end-to-end without help in under 90 seconds.
2. Steffi can log in on a second device, see that booking appear in real-time, set a price, change status, and the first device gets a push notification within 5 seconds.
3. Both devices receive correctly branded emails at the appropriate moments.
4. Every screen has loading, empty, and error states.
5. No console warnings in production mode.
6. App size < 30 MB.
7. Cold start < 2.5 seconds on iPhone 12 or newer.
8. Works offline (read cached data; queue writes).
9. The demo script runs cleanly three times in a row with reseed between.

---

# APPENDIX C — Anti-Patterns (What NOT to Do)

- ❌ **Don't** put SMTP credentials in the app bundle. Edge Function only.
- ❌ **Don't** call `react-native` APIs from `/app` screens — always via `/components/ui`.
- ❌ **Don't** use `Alert.alert()` — use the `Sheet` component for confirms.
- ❌ **Don't** use spinners as the only loading state — skeletons except for tiny inline button cases.
- ❌ **Don't** use placeholder-as-label — always real visible labels.
- ❌ **Don't** auto-request push permission on launch — ask after first booking.
- ❌ **Don't** ship `console.log` in production builds — add Sentry, strip via Babel plugin.
- ❌ **Don't** use `Date.now()` for scheduling math — always go through `/lib/date.ts` with `Europe/London` timezone.
- ❌ **Don't** store photos as base64 in the database — always Supabase Storage URLs.
- ❌ **Don't** hardcode strings that should be i18n-able later — pull from `/constants/copy.ts`.
- ❌ **Don't** invent new colours — only use the brand palette.
- ❌ **Don't** invent new font sizes — only use the typography scale.
- ❌ **Don't** add features beyond the phase you're in. Phase boundaries are sacred.

---

# APPENDIX D — Phase Execution Order Reminder

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → (client approval) → Phase 9
```

**For each phase:** read the entire phase, ask any clarifying questions before writing code, then execute every task. After each phase, run the acceptance criteria checklist and only proceed when all boxes are ticked.

---

**END OF MASTER BUILD PROMPT.**

# Progress

> Session-level continuity log. Update at the end of every working session so when you (or Claude Code in a new session) pick up tomorrow, the context is clear. This is a working document — overwrite freely, but timestamp entries.

## Where we are

**Last updated:** 2026-05-17 — Phase 5 complete
**Current phase:** Phase 5 — Shop dashboard ✅ DONE
**Next milestone:** Phase 6 — Notifications

## Status

- ✅ Master build spec: `/CLAUDE.md` complete (890-line build prompt installed)
- ✅ Skills installed: 11 in `.claude/skills/`
- ✅ Slash commands installed: 7 in `.claude/commands/`
- ✅ Doc stubs in `/docs/`
- ✅ Settings: `.claude/settings.json` configured
- ✅ **Phase 0: Foundation — DONE**
- ✅ **Phase 1: Database, Storage, Seed — DONE** (email Edge Function + templates deferred to post-demo)
- ✅ **Phase 2: Authentication — DONE**
- ✅ **Phase 3: Customer booking wizard — DONE**
- ✅ **Phase 4: My bookings (customer side) — DONE**
- ✅ **Phase 5: Shop dashboard + kanban — DONE**
- ⬜ Phase 6: Notifications (email + push)
- ⬜ Phase 7: Polish (motion, haptics, accessibility)
- ⬜ Phase 8: Demo prep (seed, branding, build)
- ⬜ Phase 9: Production deployment

## Phase 0 — what was built

- Expo SDK 55 project (`steffny-couture`), Expo Router entry, App.tsx/index.ts removed
- NativeWind v4 wired (babel preset, metro transform, `global.css`, brand tokens in `tailwind.config.js`)
- Reanimated 4 + `react-native-worklets`; TypeScript strict + `noUncheckedIndexedAccess`; `@/*` alias
- All Phase 0 dependencies installed and pinned to SDK 55 versions
- `constants/` — `brand.ts`, `shop.ts`, `alteration-types.ts`
- `lib/` — `env.ts`, `supabase.ts`, `haptics.ts`, `date.ts`, `format.ts`, `whatsapp.ts`, `motion.ts`, `query-client.ts`
- `components/ui/` — Box, Text, Screen, PressableScale, Button, Card, Input, StatusPill, Skeleton, EmptyState
- `app/` — root layout (Fraunces + Inter loading, providers, splash hold) + `(customer)`/`(shop)`/`(auth)` route groups with placeholder screens + `+not-found`
- Folder scaffold per CLAUDE.md §2.2 (`features/`, `emails/`, `supabase/`, `types/`)
- ESLint 9 + Prettier; `typecheck`, `lint`, `format` scripts
- ✅ `npm run typecheck` clean · ✅ `npm run lint` clean · ✅ `expo-doctor` 18/18 · ✅ iOS production bundle exports

## Phase 1 — what was built

- 6 migrations applied to remote project `dugooqvhxgzfdrowwnck` via `supabase db push`:
  - `001_initial_schema` — 6 tables, indexes, updated_at/profile/status-history triggers
  - `002_rls_helpers` — `is_staff()` / `is_manager()` / `can_edit_bookings()` / `current_user_role()`
  - `003_rls_policies` — RLS enabled + policies on all 6 tables (4-role model)
  - `004_storage_buckets` — `booking-photos` (private) + `profile-avatars` (public) + policies
  - `005_seed_alteration_types` — 8 types
  - `006_grants` — API-role grants (raw-SQL tables miss Supabase's default privileges)
- Shop user seeded: `steffi@steffnycouture.co.uk`, role `manager` (`scripts/seed-shop-user.mjs`)
- `types/database.ts` generated; `lib/supabase.ts` now `createClient<Database>`
- Verified: booking insert + status change auto-log history; RLS smoke test 9/9 passed
- **Deferred to post-demo:** `send-email` Edge Function (§1.5) + 5 react-email templates (§1.6)

## Phase 2 — what was built

- **Session persistence:** `lib/auth-storage.ts` — a chunked `expo-secure-store` adapter (Supabase sessions exceed SecureStore's ~2 KB limit). `lib/supabase.ts` now runs with `persistSession` + `autoRefreshToken`; refresh pauses on app background via `AppState`.
- **Auth feature** (`features/auth/`):
  - `schemas/` — Zod schemas for sign-in, reset request, new password
  - `api/auth-api.ts` — `signIn` / `signOut` / `sendPasswordReset` / `updatePassword` / `signUpWithMagicLink` / `completePasswordRecovery`; raw `AuthError`s translated to brand-voice copy
  - `hooks/use-auth.tsx` — `AuthProvider` + `useAuth() → { session, profile, isLoading, isStaff }`
  - `hooks/use-view-override.ts` — dev-only flag backing the view switcher
  - `types/` — `Profile`, `UserRole`, `isStaffRole()` (mirrors the DB `is_staff()`)
  - `components/dev-view-switcher.tsx` — `__DEV__`-only floating control to preview the customer flow
- **Routing:** root `_layout.tsx` wraps the app in `AuthProvider` and holds the splash until the first session resolves; `(shop)/_layout.tsx` redirects non-staff to `/login`; `(customer)/_layout.tsx` redirects signed-in staff into the shop group.
- **Screens:** `(auth)/login.tsx` (email + password sign-in, RHF + Zod) and `(auth)/reset.tsx` (request a recovery email / set a new password via the deep link). Shop dashboard placeholder gained a temporary sign-out button.
- **Verified:** `npm run typecheck` clean · `npm run lint` clean · iOS production bundle exports.
- **Deferred:** device verification of the four acceptance criteria (login routing, customer default, session-survives-restart, reset round-trip) — needs a physical device plus the Supabase redirect-URL config (below). Consistent with how Phase 0/1 handled hardware-dependent checks.
- **Note:** password-reset emails use Supabase's built-in auth mailer — they do **not** depend on the deferred `send-email` Edge Function.

## Phase 3 — what was built

- **Bookings feature** (`features/bookings/`): a Zustand draft store persisted to disk (`lib/draft-storage.ts`, file-system adapter — ADR-0007); per-step Zod schemas; pure slot logic; TanStack Query API + hooks for alteration types, shop settings and booked slots; `useSubmitBooking`.
- **UI primitives:** `ProgressBar`, `Sheet` (bottom sheet — replaces `Alert.alert`), `Chip`, `Textarea`, `Select`, `Toggle`.
- **The six-step wizard** (`app/(customer)/book/`, a modal over the welcome screen): type · photos · details · schedule · contact · review, plus the terminal `confirmed` screen. Shared `WizardHeader` (progress bar + discard sheet) and `WizardStep` layout.
- **Welcome screen** (`app/(customer)/index.tsx`): hero panel, primary/secondary CTAs, maps/phone/Instagram pills, an opening-hours card, and a "Continue your booking" resume card.
- **Photos:** captured + compressed (`expo-image-manipulator`) + uploaded to `booking-photos/bookings/<id>/` as picked; the booking id is generated client-side (`expo-crypto`) so uploads land before the row exists.
- **Submission:** re-checks the slot, inserts the booking as a guest row, optionally starts a magic-link account; the confirmed screen shows the generated reference plus WhatsApp / add-to-calendar CTAs.
- **Verified:** `npm run typecheck` clean · `npm run lint` clean · iOS production bundle exports.
- **Deferred:** the `booking_confirmation` + `internal_alert` emails on submit — they wait on the Phase 1 `send-email` Edge Function (marked TODO in `useSubmitBooking`). Device verification of the acceptance criteria is also pending a physical iPhone, consistent with Phase 0–2.
- **New deps:** `expo-image-manipulator`, `expo-calendar`, `expo-crypto`.
- **Deviations:** draft persistence uses a file-system adapter, not the booking-wizard skill's mandated MMKV (ADR-0007); a minimal `(customer)/bookings/` placeholder was added so the welcome screen's "My bookings" CTA doesn't dead-end (the real screen is Phase 4).

## Phase 4 — what was built

- **Migration `007_guest_booking_access`** — applied to remote `dugooqvhxgzfdrowwnck`. Four `security definer` functions (`get_guest_bookings`, `get_guest_booking_history`, `cancel_guest_booking`, `reschedule_guest_booking`) keyed on the unguessable booking UUID as a capability token, so a guest with no auth session can still read/manage their own bookings (the Phase 1 RLS makes booking reads authenticated-only). Plus an anon storage SELECT policy on `booking-photos` (the booking id is in every photo path, so reading one already proves the caller holds it). Smoke-tested: anon `get_guest_bookings` → HTTP 200.
- **Guest-access model** — chosen over relaxing RLS to an email-keyed anon policy (email is guessable) — see the AskUserQuestion decision. Booking ids are remembered on-device in `lib/guest-bookings.ts` (file-system store, same Expo Go-safe pattern as the wizard draft).
- **Customer-bookings layer** (`features/bookings/`): `api/customer-bookings.ts` (list/detail/history/cancel/reschedule + private-bucket signed photo URLs), six hooks (`useMyBookings`, `useBooking` with a Realtime channel, `useBookingHistory`, `useBookingPhotos`, `useCancelBooking`, `useRescheduleBooking`), `status.ts` (active/past + lifecycle helpers), new query keys.
- **Screens** (`app/(customer)/bookings/`): real `index.tsx` (Active/Past sections, skeletons, error + empty states, pull-to-refresh), `[id]/index.tsx` (status hero, appointment, photo gallery, live timeline, pricing, WhatsApp/Call/Reschedule/Cancel), `[id]/reschedule.tsx` (modal reusing the wizard's day strip + calendar + slot logic), nested `_layout.tsx`.
- **Components:** `BookingCard`, `StatusTimeline`, `PhotoViewer` (full-screen pinch-zoom gallery), `BookingPhotos`, `FadeInView` (`/components/motion`); `Screen` gained pull-to-refresh; `lib/alteration-icons.ts` extracted the shared Lucide icon resolver.
- **Realtime:** `useBooking` subscribes to `postgres_changes` on the row — delivered through RLS, so it reaches signed-in customers; guests (no session) get a `useFocusEffect` refetch + pull-to-refresh instead (the approved trade-off).
- **Verified:** `npm run typecheck` clean · `npm run lint` clean · iOS production bundle exports · migration applied + RPC smoke-tested.
- **Deferred:** device verification of the four acceptance criteria (consistent with Phases 0–3); a real `supabase gen types` run — the four migration-007 function types are hand-mirrored into `types/database.ts` because gen-types needs Docker or an access token, neither available here (the signatures are accurate).

## Phase 5 — what was built

- **Migration `008_shop_manual_bookings`** — applied to remote. A `bookings` INSERT policy for staff (`is_staff()`); migration 003 only allowed guest/customer inserts, so walk-in bookings were refused.
- **Shop data layer** (`features/bookings/`): `api/shop-bookings.ts` (fetch-all, status/field updates, manual-booking insert); hooks `useShopBookings` (list + Realtime on the `bookings` table), `useUpdateBookingStatus`, `useUpdateBooking`, `useCreateManualBooking`. Detail reuses Phase 4's `useBooking`/`useBookingHistory`/`useBookingPhotos`.
- **Customers feature** (`features/customers/`): pure `aggregateCustomers` / `findCustomer` — there is no customers table; a customer is bookings grouped by normalised phone (then email).
- **Settings feature** (`features/settings/`): `updateShopSettings`, alteration-type admin (`useAllAlterationTypes`, upsert, active-toggle).
- **Shop shell** — `(shop)/_layout.tsx` is now bottom tabs (Today · Bookings · Customers · Settings); `bookings/` and `customers/` are nested stacks.
- **Screens:** Today (greeting, KPI strip, today's list, "needs a quote", FAB); Bookings with a List/Kanban/Calendar segmented switcher; shop booking detail (editable price/final/notes saved on blur, status actions, customer contact, audit timeline); manual-booking modal; customers list + detail (spend, history); settings (opening hours, blocked dates, slot length, alteration-service manager, sign out).
- **Components:** `KpiTile`, `ShopBookingCard`, `KanbanBoard`/`KanbanCard` (long-press drag-and-drop, column z-lift, board-scroll lock while dragging), `CustomerRow`, `StatusActions`, `BookingCalendar`, `TimeChips`; new UI primitives `Segmented` + `Fab`.
- **Kanban drag** — long-press a card, drag across columns; the drop column (from `absoluteX + scrollX`) sets the status. Non-optimistic: the card springs home and the board refetches, so a failed update naturally reverts.
- **Verified:** `npm run typecheck` clean · `npm run lint` clean (0 problems) · iOS production bundle exports · migration 008 applied.
- **Deferred:** status-change emails (the `TODO(phase-1-email)` in `use-update-booking-status.ts`) ride with the Phase 6 email work; alteration-type management does create/edit/active-toggle but not icon-picking or hard delete (active-toggle replaces delete by design). Device verification carried as in Phases 0–4.

## Open questions / pending decisions

- ✅ GitHub: `main` + `develop` pushed to `https://github.com/srj-naik04/steffny-couture.git`.
- ✅ Supabase: 4-role model (customer/tailor/manager/owner + admin) chosen over CLAUDE.md's 3-role. Use the **legacy JWT anon key** (in `.env.local`); the `sb_publishable_` key errors on this project. Expo app — Supabase's Next.js quickstart (`@supabase/ssr`) does not apply.
- ✅ Session persistence: `expo-secure-store` chosen over MMKV (MMKV breaks the Expo Go demo). Chunked adapter in `lib/auth-storage.ts`. See ADR-0006. The wizard draft now uses a file-system adapter (`lib/draft-storage.ts`, ADR-0007); `react-native-mmkv` stays unused at runtime — dev-build query-cache persistence is its only remaining possible use.
- ⏳ Supabase Auth → URL Configuration: add the password-reset redirect URLs (`steffnycouture://reset` + the `exp://…/--/reset` variants) before testing reset on a device. See docs/SETUP.md Part 8.
- ⏳ SMTP credentials needed when email work resumes post-demo (a Gmail app password on a dedicated test account for dev).
- ⏳ Email Edge Function (post-demo) needs the service-role key + legacy JWT secret set as Supabase function secrets (`supabase secrets set`) — never committed.
- ⏳ Confirm with Bunty: who uses the app day-to-day (role design for Phase 2).
- ⏳ Confirm: opening price for Bunty.
- ⏳ Confirm: Apple/Google account ownership.

## Recent changes

### 2026-05-17 — Phase 5
- Built the shop dashboard: bottom-tab shell, Today, Bookings (list/kanban/calendar), booking detail, manual booking, customers, settings.
- Migration `008` applied — staff INSERT policy so walk-in bookings can be created.
- Kanban drag-and-drop: long-press a card, drop it on a column to change status; non-optimistic so a failed update reverts on refetch.
- Status-change emails deferred to the Phase 6 email work (`TODO(phase-1-email)` marked in `use-update-booking-status.ts`).

### 2026-05-17 — Phase 4
- Built customer "My bookings": list, detail, reschedule modal; the customer-bookings data layer; `BookingCard`, `StatusTimeline`, `PhotoViewer`, `FadeInView`; pull-to-refresh on `Screen`.
- Migration `007` applied to remote — guest-access `security definer` functions keyed on the booking UUID (chosen over an email-keyed anon RLS policy, which would leak bookings to email-guessers).
- `gen types` could not run (no Docker, no access token) — the four new function types are hand-mirrored into `types/database.ts`; replace with a generated run when possible.
- Realtime works for signed-in customers; guests fall back to refetch-on-focus — true guest realtime needs an anon RLS policy on `bookings`, which would defeat the privacy model.

### 2026-05-17 — Phase 3
- Built the customer booking wizard: the 6-step flow, the welcome screen, the bookings feature module, and 6 new UI primitives.
- Chose a file-system draft-persistence adapter over the booking-wizard skill's mandated MMKV — MMKV breaks the Expo Go demo (ADR-0007, refining ADR-0005/0006).
- Photos upload to their final `bookings/<id>/` storage folder before the booking row exists; the booking id is generated client-side so no later move is needed (storage RLS only checks the path prefix).
- Confirmation emails on submit deferred with the Phase 1 `send-email` work — marked TODO in `useSubmitBooking`.
- Added a minimal `(customer)/bookings/` placeholder; the real list/detail is Phase 4.

### 2026-05-17 — Phase 2
- Built authentication: session persistence, auth feature module, role-based routing, sign-in + password-reset screens.
- Chose `expo-secure-store` over CLAUDE.md's mandated MMKV for the session — MMKV is a native module that breaks the Expo Go demo path (ADR-0006). Wrote a chunking adapter since a Supabase session overflows SecureStore's ~2 KB limit.
- Followed the Phase 1 four-role model (`customer/tailor/manager/owner` + `admin`) over CLAUDE.md's single `shop` role — `isStaffRole()` mirrors the DB `is_staff()` helper.
- Role routing implemented via route-group guards (Expo Router v4 idiom) with `AuthProvider` in the root layout, rather than literally branching the group inside root `_layout.tsx`.
- Password reset uses Supabase's built-in auth mailer; the recovery deep link is parsed by hand because the client runs with `detectSessionInUrl: false`.

### 2026-05-17 — Phase 1
- Built database, RLS, storage and seed data; email work explicitly deferred to post-demo.
- Chose the 4-role model (rls-policies skill / ARCHITECTURE.md) over CLAUDE.md §1.1's 3-role.
- Followed the skill's split-migration convention (one concern per file) over CLAUDE.md's single `001_initial.sql`.
- Added `006_grants.sql` — raw-SQL `create table` does not inherit Supabase's default privileges, so the API roles needed explicit grants.
- Migrations applied to remote via `supabase db push` (CLI authenticated with a personal access token).

### 2026-05-17 — Phase 0
- Completed Phase 0 in full; all acceptance criteria met except the two requiring physical hardware (Expo Go boot) and live Supabase verification, both deferred to a device session.
- Discovered `e:\steffny-couture` was sitting inside a drive-wide git repo (`E:\.git`) wired to an unrelated project (`Majestic-Escape/experiences-landing-page`). Initialised a proper standalone repo for this project instead.
- Reanimated pinned to 4.x with `react-native-worklets` (SDK 55 default; spec said "Reanimated 3" — superseded).
- ESLint downgraded 10 → 9 for `eslint-config-expo@55` compatibility.

### 2026-05-17 — kit
- Kit assembled (11 skills, 7 commands, docs, settings.json); master build prompt finalised at 890 lines.

## Notes for next session

1. **First action:** `/phase-start 6` — Notifications (Expo push, in-app notification centre, email lifecycle, WhatsApp deep links). This is also where the deferred `send-email` Edge Function + 5 react-email templates (CLAUDE.md §1.5/§1.6) finally land, plus the `TODO(phase-1-email)` call sites in `useSubmitBooking` and `useUpdateBookingStatus`.
2. **Phase 4 guests:** booking ids are stored on-device (`lib/guest-bookings.ts`); guests read/manage bookings via the migration-007 functions. The remembered ids are the only handle a guest has — clearing app data loses the list (acceptable; documented).
3. **Device verification still owed:** the Phase 3 checks (book end-to-end, photos in Storage, reference match, no data loss) and the Phase 4 checks (list filters, timeline, realtime status update, WhatsApp link) need a physical iPhone. Shop login: `steffi@steffnycouture.co.uk` / `Steffny-Couture-2026`.
4. Email Edge Function + templates (CLAUDE.md §1.5–1.6) still owed — schedule after the first demo. Once shipped, wire the two `send-email` calls in `useSubmitBooking` (marked TODO) and the customer + internal booking emails fire on submit.
5. After any future migration, regenerate types: `npx supabase gen types typescript --linked > types/database.ts`.
6. `react-native-mmkv` is installed but unused at runtime (ADR-0007) — safe to remove, or keep for dev-build query-cache persistence.

## Demo notes (after live demos)

(Fill in after each client demo.)

## Wins / blockers log

- **2026-05-17 win:** Phase 5 shop dashboard green — tab shell, Today, list/kanban/calendar, detail, manual booking, customers, settings; kanban drag-and-drop working; migration 008 applied; typecheck + lint clean, iOS bundle exports.
- **2026-05-17 win:** Phase 4 "My bookings" green — list/detail/reschedule, guest-access migration 007 applied + smoke-tested, realtime wired; typecheck + lint clean, iOS bundle exports.
- **2026-05-17 blocker (resolved):** migration 007 push failed — no Supabase access token in the environment; resolved with the DB password (`supabase db push --db-url`). `gen types` still blocked (needs Docker/token) — function types hand-mirrored instead.
- **2026-05-17 win:** Phase 3 booking wizard green — 6-step flow, welcome screen, file-system draft persistence, background photo upload, guest submission; typecheck + lint clean, iOS bundle exports.
- **2026-05-17 win:** Phase 2 auth green — chunked secure-store session persistence, role-based route guards, sign-in + password-reset screens; typecheck + lint clean, iOS bundle exports.
- **2026-05-17 win:** Phase 1 backend green — 6 migrations applied to remote, RLS smoke test 9/9, typecheck + lint clean.
- **2026-05-17 blocker (resolved):** API roles got "permission denied" — raw-SQL tables skip Supabase's default privileges; fixed with `006_grants.sql`.
- **2026-05-17 win:** Phase 0 foundation green — typecheck, lint, expo-doctor, and a real iOS bundle export all pass.
- **2026-05-17 blocker (resolved):** project folder was inside the wrong git repo; fixed by initialising a dedicated repo.

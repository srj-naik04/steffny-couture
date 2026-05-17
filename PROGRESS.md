# Progress

> Session-level continuity log. Update at the end of every working session so when you (or Claude Code in a new session) pick up tomorrow, the context is clear. This is a working document — overwrite freely, but timestamp entries.

## Where we are

**Last updated:** 2026-05-17 — Phase 3 complete
**Current phase:** Phase 3 — Customer booking wizard ✅ DONE
**Next milestone:** Phase 4 — Customer "My bookings"

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
- ⬜ Phase 4: My bookings (customer side)
- ⬜ Phase 5: Shop dashboard + kanban
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

1. **First action:** merge `feat/phase-3-booking-wizard` → `develop`, then `/phase-start 4`.
2. Phase 4 (Customer "My bookings"): replace the `(customer)/bookings/index.tsx` placeholder with the real list + `[id]` detail. Query bookings by `customer_id` or a locally-stored guest email — persist the guest's email on submission so guests can see their bookings (the wizard already collects it; store it the same Expo Go-safe way as the draft).
3. **Device verification still owed:** the four Phase 3 acceptance checks (book end-to-end, photos in Storage, reference match, no data loss on back-navigation) need a physical iPhone. Shop login for the shop side: `steffi@steffnycouture.co.uk` / `Steffny-Couture-2026`.
4. Email Edge Function + templates (CLAUDE.md §1.5–1.6) still owed — schedule after the first demo. Once shipped, wire the two `send-email` calls in `useSubmitBooking` (marked TODO) and the customer + internal booking emails fire on submit.
5. After any future migration, regenerate types: `npx supabase gen types typescript --linked > types/database.ts`.
6. `react-native-mmkv` is installed but unused at runtime (ADR-0007) — safe to remove, or keep for dev-build query-cache persistence.

## Demo notes (after live demos)

(Fill in after each client demo.)

## Wins / blockers log

- **2026-05-17 win:** Phase 3 booking wizard green — 6-step flow, welcome screen, file-system draft persistence, background photo upload, guest submission; typecheck + lint clean, iOS bundle exports.
- **2026-05-17 win:** Phase 2 auth green — chunked secure-store session persistence, role-based route guards, sign-in + password-reset screens; typecheck + lint clean, iOS bundle exports.
- **2026-05-17 win:** Phase 1 backend green — 6 migrations applied to remote, RLS smoke test 9/9, typecheck + lint clean.
- **2026-05-17 blocker (resolved):** API roles got "permission denied" — raw-SQL tables skip Supabase's default privileges; fixed with `006_grants.sql`.
- **2026-05-17 win:** Phase 0 foundation green — typecheck, lint, expo-doctor, and a real iOS bundle export all pass.
- **2026-05-17 blocker (resolved):** project folder was inside the wrong git repo; fixed by initialising a dedicated repo.

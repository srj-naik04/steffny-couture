# Progress

> Session-level continuity log. Update at the end of every working session so when you (or Claude Code in a new session) pick up tomorrow, the context is clear. This is a working document — overwrite freely, but timestamp entries.

## Where we are

**Last updated:** 2026-05-17 — Phase 0 complete
**Current phase:** Phase 0 — Foundation ✅ DONE
**Next milestone:** Phase 1 — Database, Storage, Edge Functions, Email

## Status

- ✅ Master build spec: `/CLAUDE.md` complete (890-line build prompt installed)
- ✅ Skills installed: 11 in `.claude/skills/`
- ✅ Slash commands installed: 7 in `.claude/commands/`
- ✅ Doc stubs in `/docs/`
- ✅ Settings: `.claude/settings.json` configured
- ✅ **Phase 0: Foundation — DONE**
- ⬜ Phase 1: Database & RLS
- ⬜ Phase 2: Auth
- ⬜ Phase 3: Customer booking wizard
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

## Open questions / pending decisions

- ✅ GitHub: `main` + `develop` pushed to `https://github.com/srj-naik04/steffny-couture.git`.
- ✅ Supabase connection verified — use the **legacy JWT anon key** (in `.env.local`); the `sb_publishable_` key errors on this project. This is an Expo app, so Supabase's Next.js quickstart (`@supabase/ssr`) does not apply.
- ⏳ MMKV (`react-native-mmkv` v4) is a native module — does NOT run in Expo Go. Phase 2 (session persistence) will either use `expo-secure-store` (Expo Go friendly) or move the demo to a development build. Decide before Phase 2.
- ⏳ SMTP credentials needed for Phase 1 email Edge Function (a Gmail app password on a dedicated test account for dev).
- ⏳ Phase 1 Edge Function needs the project's service-role key and legacy JWT secret set as Supabase function secrets (`supabase secrets set`) — never committed.
- ⏳ Confirm with Bunty: who uses the app day-to-day (role design for Phase 2).
- ⏳ Confirm: opening price for Bunty.
- ⏳ Confirm: Apple/Google account ownership.

## Recent changes

### 2026-05-17 — Phase 0
- Completed Phase 0 in full; all acceptance criteria met except the two requiring physical hardware (Expo Go boot) and live Supabase verification, both deferred to a device session.
- Discovered `e:\steffny-couture` was sitting inside a drive-wide git repo (`E:\.git`) wired to an unrelated project (`Majestic-Escape/experiences-landing-page`). Initialised a proper standalone repo for this project instead.
- Reanimated pinned to 4.x with `react-native-worklets` (SDK 55 default; spec said "Reanimated 3" — superseded).
- ESLint downgraded 10 → 9 for `eslint-config-expo@55` compatibility.

### 2026-05-17 — kit
- Kit assembled (11 skills, 7 commands, docs, settings.json); master build prompt finalised at 890 lines.

## Notes for next session

1. **First action:** push to GitHub if not yet done (`git push -u origin main`), then `/phase-start 1`.
2. Phase 1 needs Supabase credentials (already in `.env.local`) plus SMTP credentials for the email Edge Function.
3. Phase 1 work: SQL migration `001_initial.sql`, RLS policies, storage buckets, seed data, `send-email` Edge Function, 5 react-email templates.
4. Generate DB types after the migration: `npx supabase gen types typescript` → `/types/database.ts`.
5. Resolve the MMKV-vs-Expo-Go question before Phase 2.

## Demo notes (after live demos)

(Fill in after each client demo.)

## Wins / blockers log

- **2026-05-17 win:** Phase 0 foundation green — typecheck, lint, expo-doctor, and a real iOS bundle export all pass.
- **2026-05-17 blocker (resolved):** project folder was inside the wrong git repo; fixed by initialising a dedicated repo.

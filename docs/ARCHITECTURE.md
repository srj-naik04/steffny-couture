# Architecture

> Deeper than `CLAUDE.md`. Explains *why* decisions were made. Keep this updated as architecture evolves so future-you (or a future collaborator) doesn't have to reverse-engineer reasoning.

## High-level shape

```
                 ┌─────────────────────────────┐
                 │   Expo / React Native App   │
                 │   (iOS + Android + Web)     │
                 └─────────┬───────────────────┘
                           │
                           │ Supabase JS Client
                           │ (anon key, RLS-protected)
                           ▼
        ┌──────────────────────────────────────────────┐
        │                  Supabase                    │
        │  ┌────────┐  ┌──────┐  ┌────────┐  ┌──────┐  │
        │  │Postgres│  │ Auth │  │Storage │  │ Edge │  │
        │  └────────┘  └──────┘  └────────┘  └───┬──┘  │
        └─────────────────────────────────────────┼────┘
                                                  │
                                                  │ Nodemailer SMTP
                                                  ▼
                                       ┌──────────────────┐
                                       │  Email recipient │
                                       └──────────────────┘
```

## Key Decisions

### Expo + React Native over Flutter / Native
- **Why:** One codebase → iOS + Android + web. Claude Code is significantly stronger at React/TS than Dart. Largest ecosystem of free tooling. Most importantly: Expo Go enables zero-friction demo distribution.
- **Trade-off:** Slightly heavier bundle vs native; some advanced native APIs require config plugins. Acceptable.

### Supabase over Firebase
- **Why:** Postgres > Firestore for relational data (bookings, customers, history all relate). RLS is more powerful than Firebase Security Rules. Generous free tier. EU region (London) keeps data close.
- **Trade-off:** Smaller mobile SDK ecosystem than Firebase; we accept.

### Nodemailer over Resend / SendGrid
- **Why:** Zero monthly cost regardless of volume. Full control over SMTP. Can send from her own domain when ready.
- **Trade-off:** Deliverability requires manual DNS setup (SPF/DKIM/DMARC). One-time pain.

### Expo Push over Firebase Cloud Messaging
- **Why:** Free, no Firebase project setup, fewer moving parts.
- **Trade-off:** Routes through Expo's servers. Acceptable for our scale.

### PWA disabled / native-only for v1
- **Why:** Client (Bunty) specifically asked for a native iOS app. PWA option was considered and rejected for v1 by the client.
- **Future:** Architecture preserves the web target via Expo's `web` platform. When/if a website is wanted, run `npx expo export --platform web`.

### TanStack Query for all server state
- **Why:** Caching, optimistic updates, retry, refetch-on-focus, all out of the box. Pairs cleanly with Supabase Realtime via `setQueryData`.
- **Trade-off:** Learning curve for the query key conventions. Mitigated by `tanstack-query` skill.

### Zustand for client/draft state
- **Why:** Booking wizard needs cross-step state that survives unmounts. React Hook Form can't do this elegantly. Zustand is small, simple, persists trivially via MMKV.
- **Trade-off:** Two state libraries in the app. Boundary is clear: TanStack = server, Zustand = client.

### Client storage: expo-secure-store for the session, MMKV for the rest
- **Why:** The Supabase auth session is persisted via `expo-secure-store` (encrypted, and — unlike MMKV — it runs in Expo Go, so the demo needs no native build). MMKV remains the intended store for non-auth client state (query-cache persistence, Zustand drafts) for its ~10x speed and synchronous API.
- **Trade-off:** `react-native-mmkv` v4 is a native module and does **not** run in Expo Go; non-auth MMKV usage will land with the move to a dev build. SecureStore caps values at ~2 KB, so the session adapter (`lib/auth-storage.ts`) chunks large values. See ADR-0005 and ADR-0006.

### NativeWind over StyleSheet
- **Why:** Same utility classes as web Tailwind → makes the future web target trivially restylable. Forces consistency by limiting choice. Easier for AI to write well.
- **Trade-off:** Slight learning curve if coming from RN-StyleSheet world. Worth it.

### Reanimated 3 over legacy Animated API
- **Why:** Runs on UI thread (60fps). Composable. Reduce-motion handling. The legacy API is deprecated in practice.

### Expo Router v4 over @react-navigation directly
- **Why:** File-based routing matches Next.js mental model — clean cognitive transfer when adding the web target. Auto-generates types.

## Four-Role Access Model
- `customer` — bookers
- `tailor` — Steffi and dressmaking staff
- `manager` — Rohan or other business operators
- `owner` — read-only oversight

See `/docs/DATABASE.md` for policy templates and `.claude/skills/rls-policies/SKILL.md` for the SQL.

## Authentication & Routing (Phase 2)

- **Session:** `@supabase/supabase-js` with `persistSession` and `autoRefreshToken`, backed by the `expo-secure-store` adapter (`lib/auth-storage.ts`). Token refresh is paused while the app is backgrounded (`AppState`).
- **State:** `AuthProvider` (`features/auth/hooks/use-auth.tsx`) subscribes once to `onAuthStateChange` and fetches the `profiles` row for the signed-in user. Every screen reads `useAuth() → { session, profile, isLoading, isStaff }`.
- **Routing:** the root layout holds the splash until the first session resolves, then route-group layouts guard:
  - `(shop)` — redirects non-staff to `/login`.
  - `(customer)` — public; redirects signed-in staff to `(shop)` so returning staff land on their dashboard. A `__DEV__`-only view switcher can suspend that redirect to preview the customer flow.
- **Staff vs customer:** `isStaffRole()` mirrors the DB `is_staff()` helper — `tailor | manager | owner | admin` are staff; `customer` is not. (CLAUDE.md's original spec used a single `shop` role; the four-role DB model from Phase 1 is authoritative.)
- **Password reset:** uses Supabase's built-in auth mailer, independent of the deferred `send-email` Edge Function. The recovery deep link is parsed by hand in `features/auth/api/auth-api.ts` (`completePasswordRecovery`) because the client runs with `detectSessionInUrl: false`.
- **Guest customers:** the customer flow needs no account. `signUpWithMagicLink` is the auth primitive for the optional Phase 3 "save my details" step.

## Future Considerations (not yet built)
- **Payments**: Stripe checkout for deposits. Phase 2.
- **Multi-shop**: If Steffi opens a second location, add `shop_id` to bookings + scope queries. Easy now while data is small.
- **Inventory**: Tracking fabric, thread, materials. Out of scope.
- **POS integration**: For in-shop card payments. Out of scope.

## Decisions Log

See `/docs/DECISIONS.md` for chronological ADR-style entries when new architectural decisions are made.

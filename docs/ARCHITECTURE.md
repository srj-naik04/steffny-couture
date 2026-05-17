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

### MMKV over AsyncStorage
- **Why:** ~10x faster, synchronous, smaller memory footprint. Used for auth session, query cache persistence, Zustand persistence.
- **Trade-off:** Native module (requires native code) — but works in Expo Go via expo-config-plugin.

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

## Future Considerations (not yet built)
- **Payments**: Stripe checkout for deposits. Phase 2.
- **Multi-shop**: If Steffi opens a second location, add `shop_id` to bookings + scope queries. Easy now while data is small.
- **Inventory**: Tracking fabric, thread, materials. Out of scope.
- **POS integration**: For in-shop card payments. Out of scope.

## Decisions Log

See `/docs/DECISIONS.md` for chronological ADR-style entries when new architectural decisions are made.

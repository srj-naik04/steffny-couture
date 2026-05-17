# Architecture Decisions

A running log of significant decisions, ADR-style. Append; never edit old entries. If a decision is later reversed, write a new entry that supersedes the old one.

## Template

```
## ADR-NNNN: <Title>
**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by ADR-NNNN | Deprecated
**Context:** What's the situation?
**Decision:** What did we choose?
**Alternatives considered:** What else, and why not?
**Consequences:** What does this lock us into?
```

---

## ADR-0001: Use Nodemailer over Resend for transactional email
**Date:** 2026-05-17
**Status:** Accepted

**Context:** The app sends booking confirmations, status updates, and dress-ready notifications. Initial plan was Resend (developer-friendly, generous free tier). On reflection, considered alternatives.

**Decision:** Use Nodemailer via a Supabase Edge Function (Deno runtime, `npm:nodemailer`).

**Alternatives considered:**
- **Resend** — clean API, 3,000 emails/month free. Rejected: monthly cost above free tier, vendor lock-in, less control over SMTP.
- **SendGrid** — robust but oversized for our scale.
- **Postmark** — excellent for transactional. Free tier too small (100/mo).

**Consequences:**
- Zero ongoing cost regardless of volume.
- Full control over SMTP (use Steffi's own Gmail/Workspace initially, move to dedicated SMTP later).
- We own deliverability: must set up SPF, DKIM, DMARC on `steffnycouture.co.uk`.
- One-time DNS pain in Phase 9.
- If we later need scheduled/transactional dashboard, may revisit.

---

## ADR-0002: Single app with role-based views, no separate backoffice portal
**Date:** 2026-05-17
**Status:** Accepted

**Context:** Initially considered building a separate web admin app for Rohan / shop management. Adds complexity.

**Decision:** Single Expo app. Role on `profiles.role` dispatches to different screens. `customer`, `tailor`, `manager`, `owner`.

**Alternatives considered:**
- **Two apps** (customer mobile + admin web). Rejected: doubles maintenance, doubles deploy, doubles auth surface.
- **Mobile + web both from one Expo codebase.** Deferred to phase 2 — web target enabled, just not built yet.

**Consequences:**
- Login screen looks the same for everyone; UX after auth diverges by role.
- Same codebase serves all four roles — change to a component affects all surfaces.
- Manager-only screens still on mobile — Rohan operates from his phone.
- When/if a web target is wanted, the role-based routing is already there.

---

## ADR-0003: Expo + React Native chosen over Flutter or native iOS/Android
**Date:** 2026-05-17
**Status:** Accepted

**Context:** Bunty asked for a native iOS app with a demo. Multiple stack options viable.

**Decision:** Expo SDK 52+ with React Native, TypeScript, Expo Router v4.

**Alternatives considered:**
- **Native iOS (Swift)** — beautiful, but no Android path, no web path. Doubles effort to add Android.
- **Flutter** — strong contender. Rejected: Claude Code is significantly stronger at TS/React than Dart, and Expo Go demo distribution is unbeatable.
- **Capacitor + Ionic** — easier web crossover, weaker native feel.

**Consequences:**
- One codebase → iOS, Android (eventually), web (eventually).
- Expo Go for demo distribution — zero friction.
- Some advanced native APIs require config plugins.
- TypeScript strictness enforced throughout.

---

## ADR-0004: Supabase over Firebase
**Date:** 2026-05-17
**Status:** Accepted

**Context:** Need backend for auth, DB, storage, realtime, edge functions.

**Decision:** Supabase, EU-west-2 (London) region.

**Alternatives considered:**
- **Firebase** — mature, but Firestore is awkward for relational data (bookings ↔ customers ↔ history).
- **AWS Amplify** — too sprawling for scale.
- **Self-hosted Postgres + custom auth** — way too much work for v1.

**Consequences:**
- Postgres = real relational queries, RLS for security.
- EU region keeps data close to customers (GDPR-friendly).
- Generous free tier — likely never paid for v1.
- Edge Functions are Deno — slight learning curve.
- Supabase Realtime pairs cleanly with TanStack Query.

---

## ADR-0005: MMKV for client storage, not AsyncStorage
**Date:** 2026-05-17
**Status:** Accepted

**Context:** Need to persist auth session, Zustand draft state, query cache.

**Decision:** `react-native-mmkv`.

**Alternatives considered:**
- **AsyncStorage** — RN default. Slow, async, known issues at scale.
- **expo-secure-store** — used for sensitive tokens only (smaller, encrypted).

**Consequences:**
- ~10x faster than AsyncStorage.
- Synchronous API — simpler code.
- Native module — works in Expo Go via the existing config plugin.
- We use `expo-secure-store` for the actual auth refresh token; MMKV for everything else.

---

(Add new ADRs below this line as decisions are made.)

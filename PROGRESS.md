# Progress

> Session-level continuity log. Update at the end of every working session so when you (or Claude Code in a new session) pick up tomorrow, the context is clear. This is a working document — overwrite freely, but timestamp entries.

## Where we are

**Last updated:** 2026-05-17 — kit handoff complete
**Current phase:** Pre-Phase 0 (kit installed, no code written yet)
**Next milestone:** Phase 0 — Foundation (Expo init, brand constants, base UI primitives)

## Status

- ✅ Master build spec: `/CLAUDE.md` complete
- ✅ Skills installed: 11 in `.claude/skills/`
- ✅ Slash commands installed: 7 in `.claude/commands/`
- ✅ Doc stubs in `/docs/`
- ✅ Settings: `.claude/settings.json` configured
- ⬜ Phase 0: Foundation — pending
- ⬜ Phase 1: Database & RLS
- ⬜ Phase 2: Auth
- ⬜ Phase 3: Customer booking wizard
- ⬜ Phase 4: My bookings (customer side)
- ⬜ Phase 5: Shop dashboard + kanban
- ⬜ Phase 6: Notifications (email + push)
- ⬜ Phase 7: Polish (motion, haptics, accessibility)
- ⬜ Phase 8: Demo prep (seed, branding, build)
- ⬜ Phase 9: Production deployment

## Open questions / pending decisions

- ⏳ Confirm with Bunty: who exactly will use the app day-to-day? Steffi alone, or Steffi + Rohan + assistant? Affects role design for Phase 2.
- ⏳ Confirm: opening price for Bunty — start at £1,800 + £60/mo? Or hold at £1,500 to close faster?
- ⏳ Confirm: hosting — does Bunty want to be on the Apple/Google accounts as the owner, or developer-owned for the first year and transfer later?

## Recent changes

### 2026-05-17
- Kit fully assembled with all 11 skills, 7 slash commands, 6 doc files, settings.json
- Master build prompt finalised at 890 lines
- Brand colour palette locked: ivory/rose/gold/ink
- Stack locked: Expo + React Native, Supabase + Nodemailer

### 2026-05-16
- Initial client conversation analysed
- Tech stack pivoted from Next.js → native iOS → finally Expo (one codebase for all platforms)
- Decided against separate backoffice portal — single app with role-based views

## Notes for next session

1. **First action:** run `/phase-start 0` to begin Phase 0
2. Before that, verify environment: Node 20+, Expo CLI installed globally, Supabase CLI installed, an Apple Developer account ready (only needed at Phase 9)
3. Read `/CLAUDE.md` start-to-finish once before touching code — it'll save time
4. The skills auto-load — no need to explicitly reference them, but know they're there

## Demo notes (after live demos)

(Fill in after each client demo: what they reacted to, what they didn't, follow-ups, next-meeting plan.)

## Wins / blockers log

(Add as you go.)

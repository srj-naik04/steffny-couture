# Steffny Couture — Claude Code Kit

This is the operating manual for the Steffny Couture mobile app build. Drop the contents of this folder into the root of your project alongside your `CLAUDE.md`.

## What's in here

```
/.claude
  /skills              ← 12 skills that auto-fire based on task context
    assets-management/SKILL.md   ← image, font, storage strategy
    booking-wizard/SKILL.md
    commit-discipline/SKILL.md
    demo-readiness/SKILL.md
    email-templates/SKILL.md
    expo-react-native/SKILL.md
    motion-and-haptics/SKILL.md
    react-hook-form-zod/SKILL.md
    rls-policies/SKILL.md
    steffny-brand/SKILL.md       ★ the most important one — brand consistency
    supabase/SKILL.md
    tanstack-query/SKILL.md
  /commands            ← 7 slash commands you can invoke
    component.md       → /component <Name>
    email.md           → /email <Name>
    migration.md       → /migration <name>
    phase-check.md     → /phase-check <n>
    phase-start.md     → /phase-start <n>
    screen.md          → /screen <route>
    ship.md            → /ship
  settings.json        ← permissions, output style
/docs
  SETUP.md             ← step-by-step from empty folder to first /phase-start
  ARCHITECTURE.md      ← why decisions were made
  DATABASE.md          ← schema reference
  DECISIONS.md         ← ADR-style log
  DEMO_SCRIPT.md       ← 4-minute walkthrough
  DESIGN_SYSTEM.md     ← visual reference with code snippets
  RUNBOOK.md           ← operational procedures
  SUBMISSION_CHECKLIST.md  ← App Store + Play Store before-submission list
  PRIVACY_POLICY_TEMPLATE.md ← starter to host on the website (needs legal review)
/scripts
  fetch-site-images.mjs ← pulls images from existing steffnycouture.co.uk if needed
PROGRESS.md            ← session continuity log
SCRATCH.md             ← working notes (gitignore this)
```

## How to install

1. Copy this entire folder's contents into the root of your project repo (alongside your existing `CLAUDE.md`)
2. Make sure `.claude/`, `docs/`, `PROGRESS.md` are committed
3. Add `SCRATCH.md` to `.gitignore` if you want it private
4. Open the project in Claude Code (`claude` in your terminal at the project root)
5. Verify skills are loaded: ask Claude `which skills are available?` — should list all 11
6. Verify commands are loaded: type `/` and you should see `phase-start`, `phase-check`, etc.

## How to use

**Day 1:** `/phase-start 0` — Claude will read Phase 0 from `CLAUDE.md`, plan, and wait for approval before coding.

**During work:** Skills fire automatically based on what you're doing. Edit a screen? `expo-react-native` and `steffny-brand` auto-load. Write a form? `react-hook-form-zod` joins them. You don't need to invoke them.

**Before commit:** `/ship` — runs typecheck, lint, manual checklist, suggests commit message.

**End of phase:** `/phase-check <n>` — verifies acceptance criteria against the codebase.

**End of session:** Update `PROGRESS.md` with where you stopped. Next session starts there.

## The brand consistency story

The single biggest risk in a long-running build is drift — week 4 looks different from week 1 because details slipped. The `steffny-brand` skill defends against this. It auto-loads whenever Claude touches user-facing copy, colours, or styling, and enforces:

- No exclamation marks, no emoji in UI
- British English, sentence-case buttons
- Brand palette only (no hex codes inline)
- Fraunces + Inter only, never a third font
- Calm voice, no "Oops!" / "Yay!"

Combined with `motion-and-haptics` (vocabulary of durations) and `demo-readiness` (the polish bar), the kit makes consistency the default path of least resistance.

## Updating the kit

These files aren't sacred. When you discover a new pattern, codify it:

- New component pattern → add to `DESIGN_SYSTEM.md` and update `steffny-brand` skill
- New architectural decision → append to `DECISIONS.md`
- New operational procedure → add to `RUNBOOK.md`
- Recurring instruction to Claude → consider promoting it to a skill

The kit improves the more you use it.

## Questions

- The kit assumes the master spec `CLAUDE.md` exists at project root — written separately
- The kit assumes you've installed Claude Code (`npm i -g @anthropic-ai/claude-code` or similar)
- Skills require Claude Code v1.x or later — verify with `claude --version`

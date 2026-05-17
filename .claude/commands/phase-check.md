---
description: Run the acceptance criteria checklist for the current/specified phase against the codebase.
argument-hint: <phase-number 0-9>
---

# Phase $1 Acceptance Check

Read the "Acceptance Criteria" section for Phase $1 in `/CLAUDE.md`.

For each criterion:

1. **State** the criterion verbatim
2. **Verify** by inspecting the codebase, running scripts, or describing the manual test required
3. **Mark** as ✅ Pass, ⚠️ Partial, or ❌ Fail
4. **Cite** specific files / paths / line numbers as evidence

After the full pass, summarise:

- Overall phase status: **READY TO MERGE** | **NEEDS FIXES** | **BLOCKED**
- Top 3 issues to fix (if any), with concrete next actions
- Tech debt accumulated this phase (so we don't forget)
- Any acceptance criterion that should be revised (sometimes reality differs from the original plan)

Do not modify code in this command — this is read-only verification. If fixes are needed, surface them and let me decide what to do.

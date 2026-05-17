---
description: Start a phase from CLAUDE.md — read it, plan tasks, confirm scope before coding.
argument-hint: <phase-number 0-9>
---

# Start Phase $1

You are about to begin **Phase $1** of the Steffny Couture build.

Before writing any code, do this:

1. **Read** the entire Phase $1 section from `/CLAUDE.md` carefully — every task, every acceptance criterion, every gotcha.
2. **Read** the previous phase's section to confirm prerequisites are met.
3. **Check** the codebase for what already exists relevant to this phase — don't duplicate work.
4. **List** the concrete tasks you'll execute, in order, as a numbered todo list.
5. **Flag** any ambiguities or missing information that should be clarified before you start.
6. **Identify** which skills should auto-fire during this work (e.g., `steffny-brand`, `booking-wizard`, etc.) and confirm you've internalised their rules.

Do **not** write code yet. Wait for me to approve the plan.

After approval, execute the phase tasks in order. Commit at each logical milestone using Conventional Commits (see `commit-discipline` skill). After every task, mention which acceptance criteria from CLAUDE.md it satisfies.

When the entire phase is complete:
- Run `npm run typecheck` and `npm run lint`
- Confirm every acceptance criterion is met
- Summarise what was built
- List anything deferred to a later phase with reasoning
- Suggest the appropriate commit/PR title

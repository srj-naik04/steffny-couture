---
name: commit-discipline
description: Use this skill whenever about to commit code, write a commit message, open a pull request, or work with git in this project. Fires before any `git commit` or when reviewing what should be in a single commit. Enforces Conventional Commits, the "one commit, one concern" rule, the project's branch strategy, and PR description conventions.
---

# Commit & Branch Discipline

Future-you debugging at 1 AM will love the present-you who took the extra 30 seconds to write a good commit message.

## Conventional Commits

Format:
```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

### Allowed types
| Type | When |
|---|---|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace, missing semicolons (no logic change) |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, configs |
| `build` | Build system, EAS config, app.json changes |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverts a previous commit |

### Scope
The feature or area touched: `bookings`, `auth`, `shop`, `customer`, `wizard`, `email`, `rls`, `ui`, `motion`.

### Subject rules
- **Imperative mood**: "add", not "added" or "adds"
- **Lowercase first letter**
- **No period at the end**
- **Under 72 characters**
- **Describes what, not how**

### Examples
```
✅ feat(bookings): add multi-step booking wizard with photo upload
✅ fix(rls): allow guest bookings to be read by matching email in JWT
✅ refactor(wizard): move draft state from form to Zustand store
✅ perf(bookings): cache alteration types with infinite stale time
✅ chore(deps): bump expo to 52.0.7
✅ docs(skills): add booking-wizard skill with state model

❌ Updated stuff
❌ WIP
❌ Final fix!!!
❌ feat: bookings (no specific change described)
❌ Fixed a bug in the booking thing where photos sometimes wouldn't upload after the user pressed back and went forward again
```

## The "One Commit, One Concern" Rule

A commit should be reviewable in 60 seconds and revertable without losing unrelated work. Concretely:

- ❌ A commit that adds a feature AND fixes a typo AND bumps a dependency → 3 commits
- ❌ A commit that touches 40 files across 10 features → split by feature
- ✅ A commit that adds the booking wizard step 3 + its schema + its hook → one logical unit, fine
- ✅ A commit that renames a folder → that and only that

If `git diff --stat` shows churn across more than 3-4 unrelated areas, split.

## Body & Footer (when needed)

Body — explain *why* if non-obvious:
```
fix(wizard): preserve photo state when navigating back to step 2

Previously the photo grid reset because the Zustand draft was being
reinitialised on mount. Move draft init to a Provider higher in the tree
so the store survives unmount of any individual step screen.
```

Footer — reference issues, breaking changes:
```
BREAKING CHANGE: bookings.appointment_time is now `time` not `text`

Closes #14
```

## Branch Strategy

```
main          → production. Tagged releases only.
develop       → default. All feature branches merge here.
feat/<name>   → new features (e.g. feat/booking-wizard, feat/shop-kanban)
fix/<name>    → bug fixes
chore/<name>  → tooling, deps
hotfix/<name> → urgent prod fixes, branch from main, merge to both
```

### Workflow
1. Always start from `develop`: `git checkout develop && git pull`
2. Branch: `git checkout -b feat/booking-wizard`
3. Commit incrementally — many small commits beat one giant one
4. Push: `git push -u origin feat/booking-wizard`
5. Open PR into `develop`
6. After review/merge, delete the branch

### Naming
- Lowercase, hyphen-separated
- Descriptive: `feat/customer-bookings-list` not `feat/work`
- Scoped: include the area when not obvious

## When to Commit

Commit when:
- A logical unit of work is done (a hook + its test, a component + its story)
- About to switch contexts (lunch, end of day, switching features)
- Before a refactor, so you can revert if it goes wrong
- After making any change that *works* — don't accumulate untested code

Don't commit:
- Broken builds (`npm run typecheck` must pass)
- `console.log` statements (strip first)
- Commented-out blocks of dead code (delete; git remembers)
- Hardcoded secrets (use `.env.local`, gitignored)
- IDE-specific files (`.idea/`, `.vscode/settings.json` unless team-shared)
- Generated files that have their own build step

## Pre-commit hook

`.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run typecheck && npm run lint
```

If this fails, don't `--no-verify` around it. Fix the issue. The hook is your friend.

## PR Description Template

For every PR, fill this:

```markdown
## What
One-sentence summary of the change.

## Why
The motivation. Link to issue if applicable.

## How
Brief technical approach. Key files touched.

## Verified
- [ ] `npm run typecheck` clean
- [ ] `npm run lint` clean
- [ ] Tested on physical iPhone via Expo Go
- [ ] Acceptance criteria from CLAUDE.md Phase X met
- [ ] No new console warnings
- [ ] Brand voice respected in any new copy

## Screenshots / Recording
(Required for any UI change. Use QuickTime screen mirror from iPhone, save as .mov, drag into PR.)

## Notes for reviewer
Anything they should pay extra attention to.
```

## When Claude Code Commits Autonomously

If running Claude Code with auto-commit enabled:

1. **Never let it commit broken builds.** The pre-commit hook must run.
2. **Squash before merging** if Claude Code made many small commits while working — review the squashed version with a real eye before pushing.
3. **Read its commit messages** — Claude Code is good at format but sometimes vague on intent. Edit if so.

## Examples Specific to This Project

```
feat(brand): add Fraunces and Inter Google Fonts loading
feat(bookings): scaffold 6-step customer booking wizard
feat(bookings): wire photo upload to Supabase Storage with progress
feat(shop): build kanban board with drag-and-drop status updates
feat(emails): add booking confirmation react-email template
fix(rls): prevent customers seeing other guests' bookings via email collision
fix(wizard): restore draft on app cold start
refactor(ui): extract PressableScale into /components/ui/
chore(deps): add expo-image-manipulator for photo compression
docs(decisions): record choice of Nodemailer over Resend
build(eas): configure production profile for iOS
```

## Anti-Patterns

- ❌ Commits titled `WIP`, `update`, `fix`, `stuff`, `final`, `final-final`
- ❌ Force-pushing to shared branches (use `--force-with-lease` on your own branches only)
- ❌ Committing `.env` files (use `.env.example` for templates)
- ❌ Mixing dependency bumps with feature code
- ❌ Refactor + feature in same commit — separate so the diff is reviewable
- ❌ Skipping the body when the change isn't obvious from the subject
- ❌ "Conventional Commits" as a label without actually following the format

## When in doubt

Read your commit message aloud as: "If applied, this commit will ___". If the subject completes that sentence grammatically, you're using the imperative correctly.

- ✅ "If applied, this commit will *add booking wizard*"
- ❌ "If applied, this commit will *added booking wizard*"
- ❌ "If applied, this commit will *bookings*"

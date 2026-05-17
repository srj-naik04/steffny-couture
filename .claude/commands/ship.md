---
description: Run the full pre-flight check before committing — typecheck, lint, manual review.
---

# Ship Check

Run the full pre-flight before allowing a commit:

## Automated checks (run these)
1. `npm run typecheck` — must pass clean
2. `npm run lint` — must pass clean
3. `npm run format:check` — must pass clean
4. If tests exist: `npm test` — must pass

If any fail, list the errors with file paths and suggest fixes. Do not commit until clean.

## Manual review (perform these)
For every file in `git status` (staged or unstaged):

- [ ] No `console.log` left in production code paths
- [ ] No `TODO` / `FIXME` without a tracked issue
- [ ] No secrets, API keys, or env values hardcoded
- [ ] No commented-out blocks of code (delete; git remembers)
- [ ] No hex codes for brand colours (must use tokens)
- [ ] No `StyleSheet.create` or inline visual styles
- [ ] No exclamation marks or emoji in user-facing strings
- [ ] No `Alert.alert()` (use `Sheet` instead)
- [ ] All copy follows brand voice (`steffny-brand` skill rules)
- [ ] All new components have `accessibilityLabel` / `accessibilityRole`
- [ ] All animations respect `useReducedMotion`
- [ ] All Supabase queries respect RLS (no service-role key in client)
- [ ] If any migration was added, types were regenerated and committed

## Commit message
Suggest a commit message following Conventional Commits (`commit-discipline` skill).
- Type, scope, imperative subject
- Body if non-obvious
- Reference issue/phase if applicable

## Output
Provide:
1. Automated results (pass/fail per check)
2. Manual review issues (categorised by severity)
3. Recommended commit message
4. Whether to proceed: **READY TO COMMIT** | **FIX FIRST**

Do NOT auto-commit — wait for explicit approval after surfacing the report.

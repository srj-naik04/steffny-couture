# Setup Guide

What to do, in order, after you've decided "I'm starting the build now." From empty folder to first Claude Code command.

Estimated time end-to-end: **45-90 minutes** depending on what you already have installed.

---

## Part 1 — System prerequisites (one-time, ~30 min)

Skip what you already have. Verify with the version commands.

### Node.js 20 or later
Recommended via nvm (works on macOS / Linux / WSL):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# restart shell, then
nvm install 20
nvm use 20
node --version    # should print v20.x
```

On Windows native (without WSL), download from nodejs.org directly.

### Git
```bash
git --version
# If not installed: brew install git (Mac), apt install git (Linux), or git-scm.com (Windows)
```

### A code editor with good React Native support
**VS Code** is fine and has the best Claude Code integration. Install these extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- React Native Tools (optional)

### Watchman (macOS / Linux only — recommended for file watching)
```bash
brew install watchman    # macOS
# or apt install watchman (Linux)
```

### iOS simulator (Mac only, optional but useful)
Install Xcode from the App Store (it's 15+ GB — start the download now while you do other steps). Then:
```bash
sudo xcode-select --install
sudo xcodebuild -license accept
```

### Android emulator (optional, for Android testing)
Install Android Studio from developer.android.com → run once → Tools → AVD Manager → create a device (Pixel 6, API 34 is a good default).

### Verify Expo system requirements
```bash
npx expo-doctor
```
This will tell you what's missing or misconfigured.

---

## Part 2 — Install CLIs (5 min)

```bash
# Expo CLI is bundled with npx — no global install needed
# But these are worth installing globally:

npm install -g eas-cli           # for production builds
npm install -g supabase          # for local Supabase + migrations
npm install -g @anthropic-ai/claude-code   # if not already installed

# Verify
eas --version
supabase --version
claude --version
```

If `claude --version` doesn't work, you already have Claude Code via another install path — just confirm it works in a terminal: `claude` should boot.

---

## Part 3 — Create the cloud accounts (15 min, mostly waiting for emails)

### Supabase (required, free)
1. Go to supabase.com → sign up (use a real email, not Gmail aliases — some hosting providers reject those later)
2. Create a new project:
   - Name: `steffny-couture-prod`
   - Database password: generate a strong one, **save it to your password manager immediately**
   - Region: **West Europe (London) — eu-west-2** ← this is important for latency
   - Plan: Free
3. Wait ~2 minutes for provisioning
4. Once ready, go to Project Settings → API and note:
   - Project URL (looks like `https://xxxxxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (NEVER commit this; only used in Edge Functions)

### Expo (required, free)
1. expo.dev → sign up
2. Create an organisation or use personal account (organisation is cleaner if Bunty will eventually own it)
3. No project setup yet — that comes after first build

### Apple Developer (Phase 9 — defer for now)
Don't pay £79 yet. Wait until you're ready to submit. Even then it's Bunty's account, not yours.

### Google Play Developer (Phase 9 — defer for now)
Same. $25 one-time, in Bunty's name when the time comes.

---

## Part 4 — Create the app project (10 min)

```bash
# Pick a parent folder
cd ~/projects   # or wherever you keep code

# Create the Expo project (TypeScript template, tabs router)
npx create-expo-app@latest steffny-couture-app --template
# Choose "Blank (TypeScript)" when prompted

cd steffny-couture-app

# Confirm it boots
npx expo start
# Press 'i' for iOS simulator, 'a' for Android. Quit with 'q'.
```

If `expo start` succeeds and you see the default Expo screen, the foundation works.

---

## Part 5 — Drop in the kit (5 min)

You should have these two files I built for you:
- `STEFFNY_COUTURE_BUILD_PROMPT.md` (the master spec)
- `steffny-couture-claude-kit.zip` (the kit)

```bash
# Inside the steffny-couture-app folder
mv ~/Downloads/STEFFNY_COUTURE_BUILD_PROMPT.md ./CLAUDE.md

# Unzip the kit
unzip ~/Downloads/steffny-couture-claude-kit.zip
mv steffny-kit/.claude .
mv steffny-kit/docs .
mv steffny-kit/scripts .
mv steffny-kit/PROGRESS.md steffny-kit/SCRATCH.md steffny-kit/README.md .
rmdir steffny-kit

# Verify
ls -la
# You should see: CLAUDE.md, README.md, PROGRESS.md, SCRATCH.md, .claude/, docs/, scripts/, app/, etc.
```

---

## Part 6 — Environment variables (5 min)

```bash
# Create .env.local for your real credentials
cat > .env.local <<'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
EOF

# Edit with your real values
nano .env.local    # or open in VS Code

# Create .env.example for the repo (no secrets)
cat > .env.example <<'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
EOF
```

Add `.env.local`, `SCRATCH.md`, and the fetched-images folder to `.gitignore`:

```bash
cat >> .gitignore <<'EOF'

# project-specific
.env.local
SCRATCH.md
scripts/fetched-images/
EOF
```

---

## Part 7 — Initialise git and first commit (2 min)

```bash
git init
git add .
git commit -m "chore: initial scaffold with claude code kit"

# If you want a remote (GitHub, GitLab):
# Create the empty repo on the platform first, then:
git remote add origin git@github.com:YOUR-USERNAME/steffny-couture-app.git
git branch -M main
git push -u origin main

# Create develop branch (you'll work on this; main is production)
git checkout -b develop
git push -u origin develop
```

---

## Part 8 — Link to Supabase locally (5 min)

```bash
# Login to Supabase CLI
supabase login    # opens browser to auth

# Link this repo to your Supabase project
supabase init     # creates /supabase folder
supabase link --project-ref YOUR-PROJECT-REF
# project-ref is the xxxx in xxxx.supabase.co — find in dashboard URL or Settings → General

# Pull current schema (empty for now)
supabase db pull

# Start local Supabase (Docker required for this — install Docker Desktop if you haven't)
supabase start
# This downloads several images first time; takes 5 min. Subsequent starts are fast.
```

If you don't want to run local Supabase yet, that's fine — just work directly against the cloud project for now. Local Supabase becomes useful when you're testing migrations.

---

## Part 9 — Open in Claude Code (the moment of truth)

```bash
# From the project root
claude
```

This boots Claude Code in your project. It reads `CLAUDE.md` automatically, and the `.claude/` folder defines the skills and commands.

### First conversation
Type:
```
/phase-start 0
```

Claude Code should:
1. Read Phase 0 from CLAUDE.md
2. Plan the tasks
3. List which skills it'll use
4. Wait for your approval

If it doesn't pause and ask for approval, type:
```
Pause before writing code. Show me the plan first.
```

### Verify skills loaded
Ask Claude Code:
```
Which skills do you have access to?
```

It should list all 12:
- steffny-brand
- assets-management
- booking-wizard
- commit-discipline
- demo-readiness
- email-templates
- expo-react-native
- motion-and-haptics
- react-hook-form-zod
- rls-policies
- supabase
- tanstack-query

If any are missing — check that the folder is under `.claude/skills/<name>/SKILL.md`.

---

## Part 10 — Optional: fetch website images

If Bunty doesn't have higher-res originals to share, run the image fetch script:

```bash
node scripts/fetch-site-images.mjs
# Output goes to scripts/fetched-images/ (gitignored)
```

Then:
1. Browse the folder, pick 5-10 you like
2. Run them through squoosh.app (MozJPEG, quality 75-80)
3. Rename descriptively and move to `assets/images/`
4. Delete the rest

Wait until Phase 7 (polish) to actually use them in screens — for now, just have them sitting in the folder ready.

---

## Troubleshooting

### `expo start` fails
- Try `npx expo-doctor` — it tells you what's wrong
- Common: Node version mismatch (must be 20+)
- Common: Watchman not installed on Mac/Linux
- Common: another process using port 8081 — `lsof -i :8081 && kill -9 <pid>`

### Supabase CLI says "project not linked"
- You ran `supabase init` but not `supabase link` — do that
- Or your project ref is wrong — check the URL in dashboard

### `claude` command not found
- Run `which claude` — if nothing, install: `npm install -g @anthropic-ai/claude-code`
- If installed but PATH issue: `export PATH="$PATH:$(npm prefix -g)/bin"`

### Skills don't appear
- Folder structure must be `.claude/skills/<skill-name>/SKILL.md` — note the lowercase folder, uppercase SKILL.md
- Restart Claude Code session if you added skills mid-session

### Cannot connect to Supabase from app
- `EXPO_PUBLIC_` prefix is required for env vars to reach the client
- Restart `expo start` after changing `.env.local` — it caches
- Confirm anon key, not service_role key, is in the env var

---

## You're ready

If you've ticked off every step, you're ready to start Phase 0.

In `PROGRESS.md`, add a note with today's date — "Setup complete, starting Phase 0".

Then:
```
/phase-start 0
```

Good luck, bhai.

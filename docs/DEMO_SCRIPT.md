# Demo Script

The 4-minute walkthrough for showing the app to Bunty / Steffi. Print this and have it ready on the side. Run through it three times alone before doing it live.

The full demo readiness bar (checklists, seed data conventions, branding requirements) lives in `.claude/skills/demo-readiness/SKILL.md`. This doc is the on-the-day script.

## Pre-Demo (30 minutes before)

- [ ] Phone fully charged (or plugged in)
- [ ] On a reliable Wi-Fi network
- [ ] Steffny Couture app installed via Expo Go OR TestFlight
- [ ] Second phone / simulator open with shop login
- [ ] Database reset to fresh seed: `npm run seed:reset`
- [ ] Test email tab open (Gmail web) to show landing emails
- [ ] Volume up — haptics and notification sounds matter
- [ ] Notifications enabled on both devices
- [ ] Close Slack/WhatsApp on the demo phone — no popups during demo

## Opening (15 seconds)

> "Quick walkthrough. Two parts — the customer side, then Steffi's side. About four minutes. I'll show you a real booking flow end-to-end."

Don't oversell. Let the app do the work.

## Act 1: Customer Journey (90 seconds)

| Step | Action | What to point out |
|---|---|---|
| 1 | Open app on phone | Splash — ivory + rose, brand wordmark |
| 2 | Welcome screen | "Hounslow studio" line — local feel |
| 3 | Tap "Book an alteration" | Smooth transition |
| 4 | Step 1: pick "Hem" | Chip highlights, auto-advances — no extra Next button |
| 5 | Step 2: take/pick photo | In-thumbnail upload progress overlay |
| 6 | Step 3: pick "Wedding", type "Hem to ankle for flats" | Character counter, natural copy |
| 7 | Step 4: pick a date this week + time slot | Disabled past dates, animated chip stagger |
| 8 | Step 5: name "Aisha", phone "07700 900100", email | Auto-formats phone, validates inline |
| 9 | Step 6: review | Section edit pills — "tap to edit, doesn't lose anything" |
| 10 | Tap "Confirm booking" | Success check animation — pause, let it play |
| 11 | Pull up Gmail | Confirmation email landed — branded, real-looking |

**Talking points during this:**
- "Notice she never types her phone in twice — it remembers"
- "Every photo uploads in the background — she doesn't wait"
- "If she lost connection halfway, the draft survives"

## Act 2: Shop Side (90 seconds)

| Step | Action | What to point out |
|---|---|---|
| 12 | Switch to second device | Steffi's dashboard — same app, different role |
| 13 | Point at "Today" view | New booking has red "New" pill |
| 14 | Tap into the booking | Photos, full detail, customer contact |
| 15 | Type price quote: "£35" | Inline, no separate form |
| 16 | Tap "Confirm" | Status changes — note the colour transition |
| 17 | Drag booking card from "Confirmed" → "In Progress" | Kanban view, haptic on drop |
| 18 | Tap "Mark ready" | Confirmation sheet appears |

**Talking points:**
- "She runs her day from this kanban — no spreadsheet"
- "Internal notes are private — customers don't see them"
- "She can do this between fittings, doesn't need a desk"

## Act 3: The Closing Moment (60 seconds)

| Step | Action | What to point out |
|---|---|---|
| 19 | Back on customer device | Wait for push notification |
| 20 | Tap notification | "Your dress is ready for collection" |
| 21 | Booking detail opens with new status | Realtime — under 5 seconds |
| 22 | Tap "Open in WhatsApp" | Opens Bunty's WhatsApp, pre-filled message |
| 23 | Hop back to email | "Dress ready" email landed too |

**Pause.** Let the silence sell it.

## Closing Line (memorise)

> "That's the whole flow. Customer books in 60 seconds. Steffi runs her day from her phone. Both get reminded at the right moments. Everything you saw is one codebase — same app on Android when you want, and when you want a website, the same code ships there with no rebuild. What questions do you have?"

## Q&A Notes

Don't quote price unless asked. If asked:
> "Build is £1,800, plus £60 a month for hosting and updates. Apple developer ($99/yr) and Google Play ($25 one-time) are separate — those go directly to Apple/Google in your name."

If pressed on timeline:
> "Three weeks from green light to TestFlight in your hand. Production submission to App Store another week or two depending on review."

If asked about features not built:
> "Phase one is what I showed. SMS reminders, payments via Stripe, customer reviews — that's phase two. Want to scope it now or after you've used phase one for a month?"

## Anti-Patterns During Demo

- ❌ Apologise for missing features mid-demo — skip them entirely
- ❌ Live code anything — never
- ❌ Show terminal or dev server — kills magic
- ❌ Speak over the success animation — let it land
- ❌ Demo on a low-end Android if you only tested on iOS
- ❌ Add features the morning of — freeze 24 hours before
- ❌ Skip the reseed — old data ruins the freshness

## After the Demo

Note what they reacted to. Note what they didn't react to. That tells you what to emphasise in the next conversation. Write it in `/PROGRESS.md` under a Demo Notes section.

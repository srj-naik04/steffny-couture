---
name: demo-readiness
description: Use this skill before any client demo, when preparing seed data, before creating demo builds, or when reviewing whether a screen is "demo-grade". Fires when working on `/scripts/seed.ts`, anything in `app.json`, Phase 8 tasks, or when explicitly asked "is this ready to show". Enforces the 9-point demo checklist, seed data conventions, and the polish bar required for client demos.
---

# Demo Readiness Bar

A demo is not a build. A demo must feel **inevitable** — like the customer is looking at a finished product. This skill enforces the bar.

## The 9-Point Demo Checklist

Before any demo, every item must be ticked:

1. **End-to-end happy path works** — a stranger can complete a booking without help in under 90 seconds
2. **Realtime sync verified** — Steffi's status change visible on customer device within 5 seconds
3. **Email arrives** — booking confirmation + dress-ready notification land in the test inbox (not spam)
4. **Every screen has loading, empty, error states** — no spinner-only screens, no blank empty states
5. **No console warnings in dev mode** during the demo flow (yellow boxes will appear in screen share)
6. **App icon + splash branded** — not the Expo default
7. **Cold start < 3 seconds** on iPhone 12+
8. **Seed data looks real** — not "Test User 1", "Booking #1"
9. **Demo script runs cleanly three times in a row** with reseed between runs

If any box is unticked, demo is not ready.

## Seed Data Conventions

Realistic, varied, and tells a story. Run from `/scripts/seed.ts` via `npm run seed`.

### Customer names
British + South Asian + diverse — matches Hounslow's actual demographics. Use names like:
- Aisha Patel
- Emily Carter
- Riya Sharma
- Chloe Williams
- Priya Mehta
- Hannah Thompson
- Zainab Ahmed
- Olivia Brown
- Anika Singh
- Sarah Khan
- Maya Lewis
- Esha Joshi

❌ Avoid: "John Smith", "Test User", "Demo Customer", "Customer 1"

### Phone numbers
All `+44 7xxx xxxxxx` format. Use a clearly-fake but realistic-looking number range: `+44 7700 900xxx` (Ofcom's reserved range for fiction). Examples:
- +44 7700 900123
- +44 7700 900456

This means even if someone tries to call from the seed data, no real person is bothered.

### Emails
Use `@example.com` for seed customers. Real emails for the test shop user.

### Booking distribution
For 15 seed bookings, distribute across:
- 4 `new` (awaiting Steffi's review)
- 3 `confirmed` (price quoted, accepted)
- 4 `in_progress` (Steffi working)
- 2 `ready` (awaiting collection — high-priority visual in shop view)
- 1 `collected` (completed today)
- 1 `cancelled` (last week)

Spread `appointment_date` across:
- 2 today
- 4 this week
- 5 next two weeks
- 3 last month (historical)
- 1 cancelled in the past

### Alteration types (vary across bookings)
- Hem (most common)
- Take in
- Sleeves
- Bodice
- Zipper replacement
- Embellishment

### Photos
Use the same 4-5 royalty-free dress photos from Unsplash, varied across bookings. Store in Supabase Storage during seed.

Suggested sources (download once, commit to `/scripts/seed-photos/`):
- A pink gown
- A wedding dress
- A maroon evening gown
- A bridesmaid dress
- A prom dress

### Descriptions
Real-sounding, varied, specific:
- "Take in the waist by an inch on each side. Hem needs shortening to ankle length — I'll wear flats."
- "Cap sleeves needed converting to full sleeves with lace trim. Have the fabric, brought it with me."
- "Zipper broke at the small of the back. Needs full replacement, ideally invisible."
- "Bodice gaping at the bust. Need it taken in plus a small dart on each side."

❌ Avoid generic: "Need alteration", "Fix dress", "Make smaller"

### Price quotes
Realistic alterations pricing in £:
- Hem: 25-45
- Take in: 35-70
- Sleeves: 60-120
- Bodice: 50-95
- Zipper: 35-55
- Embellishment: 80-200

Some bookings have `price_quote` set, some don't (the `new` ones especially).

### Internal notes
Add to a few bookings to show the feature:
- "Fabric is delicate silk — handwash test before pressing."
- "Customer mentioned wedding 12 April — finish by 5 April latest."
- "Repeat customer, third alteration this year. Comp 10%?"

## Branding Assets

### App icon
- 1024×1024 PNG
- Rose background (#7C2D3E) — full bleed
- Centred white/ivory monogram: "S" in Fraunces 700, OR a custom mark of intertwined "SC"
- No drop shadow, no gradient, no text below
- iOS rounds the corners automatically — design for the square

### Adaptive icon (Android)
- Foreground PNG (1024×1024): the monogram, sized to fit within the inner 660×660 safe zone
- Background: solid `#7C2D3E`

### Splash screen
- Background: ivory (`#FAF7F2`)
- Centred wordmark "Steffny Couture" in Fraunces 700, rose colour, ~32pt equivalent
- Below: rose horizontal line, 40px wide, 1px thick
- Below: "Crafted in London" in Inter 500, 11pt, `inkMuted`, tracking widest
- Hold splash until fonts loaded + first auth check complete (managed by `expo-splash-screen.preventAutoHideAsync()`)

### `app.json` essentials
```json
{
  "expo": {
    "name": "Steffny Couture",
    "slug": "steffny-couture-app",
    "scheme": "steffnycouture",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FAF7F2"
    },
    "ios": {
      "bundleIdentifier": "uk.co.steffnycouture.app",
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "We use your camera so you can add photos of the garment you're booking.",
        "NSPhotoLibraryUsageDescription": "We need access to your photo library so you can attach photos of the garment.",
        "NSUserNotificationsUsageDescription": "We send updates when your dress is ready for collection."
      }
    },
    "android": {
      "package": "uk.co.steffnycouture.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#7C2D3E"
      }
    }
  }
}
```

## Demo Script (the literal walkthrough)

Print this and have it ready. Time-blocked to 4 minutes.

### Setup (do before he arrives / before the call)
- [ ] Phone fully charged, on Wi-Fi
- [ ] Demo Steffny Couture iOS app installed via Expo Go OR TestFlight
- [ ] Second phone or simulator open with shop login
- [ ] Database reset to fresh seed: `npm run seed:reset`
- [ ] Test email open (Gmail web tab) to show landing emails
- [ ] Volume up — haptics and notification sounds matter

### Act 1: Customer journey (90 seconds)
1. Open app on phone — show splash, ivory + rose
2. Welcome screen — point out "Hounslow studio" line
3. Tap "Book an alteration"
4. Step 1: pick "Hem" — chip highlights, auto-advances
5. Step 2: take a quick photo OR pick from library — show the in-thumbnail upload progress
6. Step 3: pick "Wedding", type a short description ("Hem to ankle for flats")
7. Step 4: pick a date this week + a time slot
8. Step 5: name "Aisha", phone "07700 900100", email a real one of yours
9. Step 6: review — point out the section edit pills
10. Tap "Confirm booking" — show the success check animation
11. Pull up Gmail in front of them — confirmation email landed

### Act 2: Shop side (90 seconds)
12. Switch to second device showing shop dashboard logged in as Steffi
13. Point at the new booking in "Today" view — it has a red "New" pill
14. Tap into it — full detail with photos
15. Type a price quote: "£35"
16. Tap "Confirm" → status changes, point out the animation
17. Hold the booking card and drag from "Confirmed" column to "In Progress" in kanban view — show drag animation + haptic
18. Tap "Mark ready" — confirmation sheet appears

### Act 3: The closing moment (60 seconds)
19. Back on customer device — push notification arrives within seconds: "Your dress is ready for collection"
20. Tap the notification → opens booking detail with new status
21. Tap "Open in WhatsApp" → opens Bunty's WhatsApp pre-filled with message
22. Hop back to email — "dress ready" email landed too
23. Pause. Let it sink in.

### Closing line (memorise)
> "That's the whole flow. Customer books in 60 seconds. Steffi runs her day from her phone. Both get reminded at the right moments. Everything you saw is from one codebase — same app on Android, and when you want a website, same code ships there too with no rebuild. What questions do you have?"

Don't quote price unless asked. Let him ask.

## Anti-Patterns for Demos

- ❌ **Long, talky setup before the first interaction** — show, don't tell
- ❌ **Apologising for missing features mid-demo** — skip them entirely; nobody knows what's missing
- ❌ **Live coding fixes during a demo** — never. If it breaks, segue or reschedule
- ❌ **Sharing your dev server screen** — terminal noise kills the magic. Use the deployed app.
- ❌ **Demoing on a low-end Android** when you've only tested on iOS — performance gap will show
- ❌ **Adding new features the morning of** — freeze 24h before
- ❌ **Skipping the reseed** — if previous demo's data is in there, every screen looks lived-in but inconsistent
- ❌ **Speaking over the success animation** — let the silence sell it

## Before Calling It "Ready"

Run the demo script alone, three times in a row, with reseed in between. If you flinch at any step — fix it before showing the client.

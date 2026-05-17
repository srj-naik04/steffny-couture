---
name: steffny-brand
description: Use this skill whenever working on any user-facing aspect of the Steffny Couture app — writing UI copy, error messages, email content, push notifications, choosing colours, styling components, picking icons, selecting fonts, or making any visual or tonal decision. Also use when reviewing code that contains hardcoded strings, colour values, or font references. Enforces the brand voice, palette, typography, currency/date formatting, and motion philosophy. Fires for any task touching `/app/`, `/components/`, `/emails/`, or any file with user-visible text.
---

# Steffny Couture Brand Skill

This skill is the single source of truth for everything brand-related. If you find yourself making a visual or tonal choice, this file overrides your default training preferences.

## Voice & Tone

**Voice:** Warm but refined. Confident, never apologetic. We are a London couture studio, not a Silicon Valley startup.

### Core rules (non-negotiable)
- **No exclamation marks anywhere.** Not in headlines, not in success messages, not in errors. Calm confidence.
- **No "Oops!", "Yay!", "Whoops".** Errors are clear without being childish.
- **No emoji in UI copy.** Emails may use one (✓) in extreme moderation. App copy never.
- **No corporate-speak.** "Leverage", "ecosystem", "seamless experience" — banned.
- **British English.** "colour", "favourite", "centre", "personalise". `en-GB` locale.
- **Sentence case for buttons and headings.** "Book an alteration" not "Book An Alteration".
- **Active voice.** "We'll confirm shortly" not "You will be confirmed".
- **Address the reader directly as "you".** Never "users" or "customers" in UI copy.

### Voice examples

| ❌ Don't write | ✅ Do write |
|---|---|
| "Oops! Something went wrong!" | "Something didn't go through. Try again?" |
| "🎉 Booking confirmed!" | "You're booked." |
| "We've successfully received your booking submission." | "Got it — Steffi will be in touch." |
| "ERROR: Invalid phone number" | "That phone number doesn't look right." |
| "Click here to learn more" | "See how it works" |
| "Submit" (button) | "Confirm booking" |
| "FAQ" | "Common questions" |
| "Sign up" / "Register" | "Create account" |
| "Logout" | "Sign out" |

### Specific copy patterns

**Empty states** — never just "No items". Always: short title + helpful body + clear CTA.
```
Title: "No bookings yet"
Body: "When you book an alteration, it'll appear here."
CTA: "Book an alteration"
```

**Errors** — clear, actionable, no blame.
```
"That didn't go through. Check your connection and try again."
"This time slot was just taken. Pick another?"
```

**Success** — quiet confidence, not celebration.
```
"You're booked."        not "Booking confirmed! 🎉"
"Saved."                not "Successfully updated!"
"Sent to Steffi."       not "Message sent successfully!"
```

**Loading** — context, not generic.
```
"Uploading photo…"      not "Loading…"
"Finding available times…"   not "Please wait"
```

---

## Colour Palette

**Source of truth:** `/constants/brand.ts`. Never invent colours. Never use hex codes inline.

```ts
ivory:        '#FAF7F2'   // app background — warm cream, ALWAYS the screen base
surface:      '#FFFFFF'   // card backgrounds, modal interiors
surfaceAlt:   '#F4EFE8'   // raised sections, input backgrounds, hover states

rose:         '#7C2D3E'   // PRIMARY — buttons, active states, focus rings
roseDark:     '#5A1F2C'   // pressed state on rose elements
roseSoft:     '#F2D9DE'   // tonal backgrounds (status pills, badges)

gold:         '#C9A961'   // SECONDARY accent — highlights, premium markers
goldSoft:     '#F5EBD2'   // tonal gold backgrounds

ink:          '#1F1B1A'   // primary text
inkMuted:     '#5C5551'   // secondary text (subtitles, helpers)
inkSubtle:    '#9A9089'   // tertiary text (hints, timestamps)

success:      '#3F6E4A'   // muted forest, never bright green
warning:      '#B8741A'   // amber, never neon yellow
danger:       '#9B2C2C'   // muted red, never fire-truck red
info:         '#3A5878'   // muted blue

border:       '#E8E0D7'   // default borders, dividers
borderStrong: '#D4C8BA'   // emphasised borders
```

### Usage rules
- **Backgrounds:** `bg-ivory` for screens. `bg-surface` for cards. `bg-surfaceAlt` for inputs and raised sections.
- **Primary action:** `bg-rose` with `text-ivory` on top. Pressed → `bg-roseDark`.
- **Secondary action:** `bg-surface` + `border border-borderStrong` + `text-ink`.
- **Destructive action:** `bg-danger` only for confirms; default destructive buttons should be `text-danger bg-surface border-danger/30`.
- **Status pills:** use tonal backgrounds (`bg-roseSoft`, `bg-goldSoft`, `bg-success/10`, etc.) with the matching strong colour for text.
- **Gold is rare.** Use for: premium markers ("Ready for collection"), accent details on success states, the brand logotype. Never for primary CTAs.
- **No pure black.** `text-ink` (#1F1B1A) is our black.
- **No pure white text on rose unless contrast tested.** Use ivory.
- **Shadows always paired with a 1px border** in the same family — pure shadows on white look generic.

### Forbidden colours
- ❌ `#000000` pure black
- ❌ `#FF0000` fire-truck red
- ❌ Tailwind's default `red-500`, `green-500`, `blue-500` etc. — only the project palette
- ❌ Gradients except: subtle gold-shimmer on success moments, never on buttons
- ❌ Neon, fluorescent, or "Material Design" saturated colours

---

## Typography

**Source of truth:** `/constants/brand.ts` typography object + Tailwind font families.

- **Display / Headings:** `Fraunces` — warm modern serif. Use weights 600 and 700 only.
- **Body / UI:** `Inter` — clean sans. Use weights 400, 500, 600.

### When to use which
- **Fraunces** → page titles, section headers, the brand wordmark, key numbers/prices on success screens
- **Inter** → everything else (body, buttons, labels, captions, form inputs)
- **Never mix more than these two fonts.** No third font for "fun".
- **Never use Fraunces below 18pt.** It loses its character.
- **Never use Inter above 32pt.** It loses its personality.

### Scale (line-height in parens)
```
text-3xl 32 (40)  — Fraunces 700 — Page hero
text-2xl 26 (34)  — Fraunces 700 — Section header
text-xl  22 (30)  — Fraunces 600 — Card title
text-lg  18 (26)  — Inter 600    — Emphasised body
text-base 16 (24) — Inter 400    — Default body
text-sm  14 (20)  — Inter 400    — Secondary
text-xs  12 (16)  — Inter 500    — Captions, uppercase labels
```

### Rules
- Letter-spacing on Fraunces: default (none).
- Letter-spacing on Inter caps/labels: `tracking-wide` (0.025em).
- Never use `font-weight: bold` via CSS — always pick the loaded font weight.
- Numbers in receipts/prices/totals: `font-variant-numeric: tabular-nums` for alignment.

---

## Formatting

### Currency
- Always `£` prefix, two decimals, no space: `£42.00`, `£420.00`
- Free → "Free" (capitalised), never `£0.00`
- Ranges: `£15 – £30` (en-dash, spaces) when listing alteration price bands

### Phone numbers
- Always `+44 7834 877992` format (international + UK mobile spacing)
- Tap-to-call: `tel:+447834877992` (no spaces in href)

### Dates
- **Short** (in lists, cards): `Wed 21 May` — day abbreviation + day-of-month + month abbreviation
- **Long** (headers, detail screens): `Wednesday, 21 May 2026`
- **Relative** (recent activity): `2 hours ago`, `Yesterday`, `3 days ago`. Past 7 days use relative, beyond switch to short date.
- All dates rendered through `/lib/date.ts` with `Europe/London` timezone — never raw `toLocaleDateString()`.

### Times
- 12-hour with space + AM/PM: `2:30 PM`, `10:00 AM`
- Time ranges: `2:30 PM – 4:00 PM` (en-dash, spaces)
- ❌ Never `14:30` in customer-facing copy. Internal shop view may use 24h if it improves density.

### Addresses
- Steffny Couture address — always exactly: `255 High Street, Hounslow, London TW3 1EA`
- No abbreviation of "Street".

---

## Iconography

- **Library:** `lucide-react-native` only. Don't import from other icon sets.
- **Stroke width:** 1.75 default for elegance. 2 only for very small icons (≤16px).
- **Size:** match adjacent text x-height: 16 with `text-sm`, 20 with `text-base`, 24 with `text-lg`+
- **Colour:** inherits `text-*` of parent. Don't hardcode icon colours.
- **Decorative icons:** `accessibilityElementsHidden`.

### Standard icon vocabulary
| Concept | Icon |
|---|---|
| Booking | `Calendar` |
| Customer | `User` |
| Alteration / scissors | `Scissors` |
| Dress / garment | `Shirt` |
| Photo | `Camera` / `ImageIcon` |
| Phone | `Phone` |
| WhatsApp | custom SVG (use existing `/assets/icons/whatsapp.svg`) |
| Confirmed | `CheckCircle2` |
| In progress | `Loader2` (no spin — static) |
| Ready | `Package` |
| Collected | `CheckCheck` |
| Cancelled | `XCircle` |
| Settings | `Settings` |
| Sign out | `LogOut` |
| Edit | `Pencil` (never `Edit3`) |

---

## Imagery & Photography

- App imagery should feel editorial: natural light, soft colours, hands working on fabric, close-ups of stitching, dress details.
- Avoid stock-photo "businesspeople shaking hands" energy.
- Customer-uploaded photos render with `rounded-2xl` and a 1px `border-border`.
- Placeholder for missing images: soft ivory background + centred Lucide `ImageOff` icon in `inkSubtle`, never a grey box.

---

## Motion Philosophy

Animation is part of the brand — it should feel intentional, never decorative.

- **200ms** for micro-interactions (chip select, toggle)
- **300ms** for default transitions (sheet open, fade)
- **500ms** for major page transitions (modal entrance)
- **Easing:** `Easing.out(Easing.cubic)` for entrances, `Easing.in(Easing.cubic)` for exits
- **Spring** (`damping: 18, stiffness: 180`) for delight moments only — success checks, drag-and-drop, FAB appear

### Rules
- **Every motion communicates a state change.** If it doesn't, remove it.
- **Reduce-motion respected** via `useReducedMotion()` — return static fallback.
- **No infinite loops** except the shimmer in skeleton loaders.
- **No bounce-cute easing** unless explicitly the "success" spring.
- **No animated emoji**, **no rainbow gradients**, **no party-popper effects** ever.

See `motion-and-haptics` skill for code-level patterns.

---

## Brand Don'ts (Hard Bans)

These will make the product feel cheap. They override anything else.

- ❌ Emoji in UI copy (except optional ✓ in emails)
- ❌ Exclamation marks in any UI string
- ❌ All-caps shouting ("ERROR", "SUCCESS")
- ❌ "Click here" — write the action instead ("See how it works")
- ❌ Stock SaaS gradients (purple-to-blue, sunset, etc.)
- ❌ Drop shadows without a paired border
- ❌ Sentence-case in buttons mixed with Title Case in headings — pick sentence case everywhere
- ❌ Material Design ripple effects (we use `PressableScale`)
- ❌ iOS default blue (#007AFF) — buttons are rose, links are rose, focus rings are rose
- ❌ The word "Submit" on any button — write what's happening ("Confirm booking", "Send message", "Save changes")
- ❌ Toasts that say "Success!" — say what succeeded ("Booking saved", "Status updated")
- ❌ Spinners as the only loading state on screens — skeletons except inline button loads
- ❌ `Alert.alert()` — use the `Sheet` component for confirms

---

## Quick Decision Tree

When you're styling something and not sure:
1. **Is it a primary action?** → `bg-rose text-ivory rounded-full`
2. **Is it a card?** → `bg-surface border border-border rounded-2xl`
3. **Is it a status indicator?** → tonal background (`-Soft` colour) with strong text colour
4. **Is the copy too long?** → it's probably too long. Cut it in half.
5. **Are you about to add an emoji?** → don't.
6. **Are you about to add `!`?** → don't.
7. **Are you using a hex code inline?** → stop, use the brand token.

---

## Reference

- Source palette: `/constants/brand.ts`
- Existing site (for context only — we're better than this): https://www.steffnycouture.co.uk
- Master spec: `/CLAUDE.md`

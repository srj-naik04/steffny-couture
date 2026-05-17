# App Store & Play Store Submission Checklist

The first submission is rejected for something silly 80% of the time. This checklist exists so it isn't.

## Before You Touch the Store Dashboards

### Legal & Compliance

- [ ] **Privacy Policy URL** hosted somewhere public (e.g., `https://www.steffnycouture.co.uk/privacy`). Both stores require this — no URL, no submission. A draft template is in `/docs/PRIVACY_POLICY_TEMPLATE.md` — adapt it, get a UK solicitor to review for ~£200.
- [ ] **Terms of Service URL** — same treatment.
- [ ] **GDPR / UK Data Protection considerations** — confirm data flow with client. The app stores: customer name, phone, email, photos, booking history. All in Supabase EU region.
- [ ] **Cookie / tracking disclosure** if you add analytics later — not needed for v1.
- [ ] **Apple's App Tracking Transparency** — we don't track. In `app.json` set no `infoPlist.NSUserTrackingUsageDescription`.

### Business Setup

- [ ] **Apple Developer account** in Bunty's name (£79/year UK). Use his email, his card. He owns the listing.
- [ ] **Google Play Developer account** in Bunty's name ($25 one-time).
- [ ] **D-U-N-S number** — required by Apple for businesses (not individuals). Free, takes 3-5 days. Apply at dnb.com.
- [ ] **Bundle ID claimed**: `uk.co.steffnycouture.app` on Apple, `uk.co.steffnycouture.app` on Google.
- [ ] **App name reserved** on App Store Connect — "Steffny Couture" should be available; if not, fall back to "Steffny Couture — Alterations".

### Required Assets

- [ ] **App icon** 1024×1024 PNG, no transparency, no alpha channel
- [ ] **Splash screen** (handled by `expo-splash-screen`)
- [ ] **Screenshots** at the following sizes:
  - iPhone 6.9" (iPhone 16 Pro Max): 1320 × 2868 (3-10 screenshots)
  - iPhone 6.5" (older): 1284 × 2778 (recommended)
  - iPad (if supporting): 2064 × 2752
  - Android phone: 1080 × 1920 minimum, several
  - Android tablet: 1200 × 1920 minimum
- [ ] **Feature graphic** (Android only): 1024 × 500
- [ ] **App preview video** (optional but recommended for App Store): 15-30s, .mov

### Screenshot Content (recommended order)

1. Booking wizard step 1 with caption "Book an alteration in 60 seconds"
2. The confirmed success screen with caption "Confirmation in seconds"
3. Shop kanban view with caption "Manage your day from one screen"
4. Booking detail with photos with caption "Every detail in one place"
5. Dress-ready notification + email side-by-side with caption "Customers know exactly when to come back"

Use [Screenshot Builder in Figma] or similar to put screen + caption + brand bg together. Don't ship raw screenshots without context.

## App Store (Apple)

### App Store Connect setup
- [ ] App name: **Steffny Couture**
- [ ] Subtitle (30 chars): **Bookings for your atelier**
- [ ] Category: Primary = **Lifestyle**, Secondary = **Business**
- [ ] Age rating: 4+
- [ ] Pricing: Free
- [ ] Availability: United Kingdom (initially; add others later)
- [ ] App Privacy questionnaire — answer truthfully:
  - Contact info: collected, linked to user
  - User content (photos): collected, linked to user
  - Identifiers: collected (for push notifications)
  - Not used for tracking
- [ ] **Demo account** for the reviewer:
  - Email: `apple-review@steffnycouture.co.uk` (forwarded to your inbox)
  - Password: a known test password
  - Pre-seeded with sample bookings so reviewer can see the staff side too
  - In review notes: "Login as `apple-review@steffnycouture.co.uk` / `<pass>` to see the full app including the staff dashboard"
- [ ] **Reviewer notes** explaining:
  - What the app does (booking management for a couture studio)
  - Why camera/photo permissions needed (customers upload garment photos)
  - Why notifications needed (status updates)
- [ ] **Support URL**: `https://www.steffnycouture.co.uk/contact`
- [ ] **Marketing URL** (optional): same as above

### Common rejection causes (avoid these)
- ❌ Crashes on launch (test cold start 10 times)
- ❌ Login required without a demo account
- ❌ Camera/photo permission denied breaks the app — handle gracefully
- ❌ Push notifications requested at launch without context — request on first relevant action
- ❌ Placeholder content visible anywhere
- ❌ Broken links to privacy policy
- ❌ Including "beta" / "test" in the visible name
- ❌ Functionality only available "coming soon"

## Play Store (Google)

### Listing
- [ ] App name: **Steffny Couture**
- [ ] Short description (80 chars): **Bookings for your couture studio — for customers and staff.**
- [ ] Full description (4000 chars): write 3-4 paragraphs covering customer flow, staff flow, brand
- [ ] Category: Lifestyle (Business as secondary)
- [ ] Tags: alterations, dressmaker, bookings, couture, London
- [ ] Content rating: Everyone
- [ ] Target audience: 18+
- [ ] Data safety section — same answers as Apple's privacy questionnaire

### Build requirements
- [ ] Target API level: latest Google requires (currently 34/Android 14)
- [ ] 64-bit support: yes (Expo default)
- [ ] App Bundle (.aab) not APK
- [ ] Signed with upload key managed by Google Play (Play App Signing enabled)

### Common Play rejections
- ❌ Missing data safety disclosure
- ❌ Permission declared but not used (e.g., declared CAMERA but never call camera)
- ❌ Target SDK below the current minimum

## Pre-Submission Test Pass

Run all of these against the **release build**, not the dev build:

- [ ] Cold start on iPhone 12+ < 3 seconds
- [ ] Cold start on a low-mid Android (Samsung A series, ~$200) < 5 seconds
- [ ] Booking flow end-to-end works on both
- [ ] Photos upload on both (camera + library)
- [ ] Push notifications arrive on both
- [ ] Email sends and arrives in test inbox
- [ ] Permission denials don't crash the app (deny camera then try to book — graceful path)
- [ ] Airplane mode → app shows offline state, doesn't crash
- [ ] Background app for 5 minutes, foreground → still works, state preserved
- [ ] Force-quit app then reopen → session preserved, draft restored
- [ ] Sign out then sign in as different role → correct dashboard shown
- [ ] Dark mode (if not explicitly disabled) renders acceptably — or set `userInterfaceStyle: 'light'` in `app.json`

## Build & Submit (via EAS)

```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

You'll need:
- For iOS: App-specific password from appleid.apple.com (for `eas submit`)
- For Android: Service account JSON from Google Play Console

## After Submission

- [ ] iOS: typical review 24-48 hours. First submission can take longer.
- [ ] Android: typical review 1-7 days for first submission, faster after.
- [ ] Have a `RUNBOOK.md` rollback procedure ready in case of post-launch crash spike
- [ ] Tell Bunty NOT to share the App Store link with customers until you've done a 24-hour soak with him + Steffi using it

## Production Smoke Test (do this BEFORE telling Bunty it's live)

1. Download from the live store (don't use TestFlight / internal track)
2. Make a real booking with your own phone + email
3. Switch to Steffi's account, see the booking, change status
4. Receive the dress-ready notification + email
5. Open the WhatsApp link
6. Sign out, sign in fresh — everything still there

Only after this passes: hand the link to Bunty.

---
name: booking-wizard
description: Use this skill whenever working on the 6-step customer booking flow in the Steffny Couture app — adding/editing wizard steps, validation, navigation between steps, photo upload, scheduling, or the success screen. Fires for any file under `/app/(customer)/book/` or anything importing the booking Zustand store or wizard schemas. Enforces the state model, validation rules per step, transition behaviour, and the "no data loss on back-navigation" rule.
---

# Booking Wizard — State, Validation, Behaviour

The booking wizard is the single most important flow in the app. It is the moment of conversion. A janky wizard kills the demo. Treat this skill as authoritative.

## The Six Steps (do not reorder)

1. **`type`** — Pick alteration type
2. **`photos`** — Upload 1–5 photos
3. **`details`** — Garment type + description
4. **`schedule`** — Pick date + time
5. **`contact`** — Name, phone, email
6. **`review`** — Summary + confirm

Plus the success screen: **`confirmed`** (not a step; not counted in progress).

## State Model

Single Zustand store for the entire wizard. Persists across step navigation. Cleared only on successful submission or explicit discard.

```ts
// features/bookings/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'booking-wizard' });
const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export type BookingDraft = {
  alterationTypeId: string | null;
  photoUris: string[];          // local URIs; converted to storage paths on upload
  photoPaths: string[];          // Supabase storage paths after upload
  dressType: string | null;
  description: string;
  brand?: string;
  neededBy?: string;             // ISO date
  appointmentDate: string | null; // YYYY-MM-DD
  appointmentTime: string | null; // HH:mm
  name: string;
  phone: string;
  email: string;
  saveDetails: boolean;
};

type Store = {
  draft: BookingDraft;
  setField: <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void;
  reset: () => void;
};

const emptyDraft: BookingDraft = {
  alterationTypeId: null,
  photoUris: [],
  photoPaths: [],
  dressType: null,
  description: '',
  appointmentDate: null,
  appointmentTime: null,
  name: '',
  phone: '',
  email: '',
  saveDetails: false,
};

export const useBookingDraft = create<Store>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      setField: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value } })),
      reset: () => set({ draft: emptyDraft }),
    }),
    {
      name: 'booking-draft',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

### Why MMKV-persisted
- App may be backgrounded mid-flow
- User may force-quit and reopen
- Crash recovery — last thing we want is a customer losing photos and details after 3 minutes of effort

### When to reset
- On successful submission (after the `confirmed` screen has been seen)
- On explicit "Discard draft" in the close-confirm sheet
- ❌ **Never on step navigation** — back/forward must preserve everything

## Validation

Single Zod schema for the whole booking; per-step validation derives a subset.

```ts
// features/bookings/schemas.ts
import { z } from 'zod';
import { isValid as isValidDate, parseISO } from 'date-fns';

export const ukPhoneRegex = /^(\+?44|0)7\d{9}$/;

export const bookingSchema = z.object({
  alterationTypeId: z.string().min(1, 'Pick an alteration type'),
  photoPaths: z.array(z.string()).min(1, 'Add at least one photo').max(5, 'Maximum 5 photos'),
  dressType: z.string().min(1, 'Pick a garment type'),
  description: z.string().min(10, 'A bit more detail helps Steffi prepare').max(1000),
  brand: z.string().optional(),
  neededBy: z.string().optional(),
  appointmentDate: z.string().refine((v) => isValidDate(parseISO(v)), 'Pick a date'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time'),
  name: z.string().min(2, 'Your name please'),
  phone: z.string().regex(ukPhoneRegex, "That phone number doesn't look right"),
  email: z.string().email("That email doesn't look right"),
  saveDetails: z.boolean(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// Per-step validation
export const stepValidators = {
  type: bookingSchema.pick({ alterationTypeId: true }),
  photos: bookingSchema.pick({ photoPaths: true }),
  details: bookingSchema.pick({ dressType: true, description: true }),
  schedule: bookingSchema.pick({ appointmentDate: true, appointmentTime: true }),
  contact: bookingSchema.pick({ name: true, phone: true, email: true }),
};
```

### Validation rules
- Validate on `Next` press — never block the user from typing
- Show inline error below the field after first invalid `Next`
- Clear the field's error as soon as it becomes valid
- Never show all errors at once on entry — that's hostile
- Error copy follows the brand voice: not apologetic, not exclamatory

## Step-by-Step Behaviour

### Step 1 — Type (`type.tsx`)
- 2-column grid of `AlterationTypeCard` components
- Each card: icon (Lucide) + label + price chip ("£15 – £30")
- Tapping a card: `haptics.selection()` + auto-advance to step 2 after 200ms (no separate "Next" button needed when there's only one decision)
- Selected card: rose border + soft rose background
- Loads `alteration_types` via TanStack Query with `staleTime: Infinity`
- Validation: handled by auto-advance

### Step 2 — Photos (`photos.tsx`)
- Grid of thumbnails (up to 5) + one "Add" tile
- Tap "Add" → action sheet: "Take photo" / "Choose from library" / "Cancel"
- Each photo uploads **immediately** in background — don't wait until submission
- Show per-thumbnail upload progress: small circular indicator overlay
- Long-press thumbnail → haptic warning + confirmation sheet to delete
- Photo preview: tap thumbnail → full-screen viewer with pinch-zoom
- Validation: at least 1 successfully uploaded photo before "Next" enables

#### Upload mechanics
- Use `expo-image-picker` with quality 0.7 (good balance, smaller upload)
- Compress further with `expo-image-manipulator` to max 1600px on long edge
- Upload to `booking-photos/drafts/<draft-id>/` initially; move to `bookings/<booking_id>/` on submission via Edge Function (or use a UUID matching the eventual booking ID — see implementation)
- Don't block UI on upload — show progress, allow proceeding to next steps if upload succeeds

### Step 3 — Details (`details.tsx`)
- Dropdown for garment type (Wedding, Prom, Evening, Bridesmaid, 21st Birthday, Casual, Other)
- Textarea for description with character counter (`0/1000`)
- Optional inputs: brand, needed-by date
- Validation: dressType chosen, description ≥ 10 chars

### Step 4 — Schedule (`schedule.tsx`)
- Horizontal scrollable week strip (7 day chips, today through +6)
- "See full calendar" → opens month picker in bottom sheet
- After date selected: time slot chips appear below, animated stagger
- Time slots derived from `shop_settings.hours[dayOfWeek]` + `slot_duration_minutes`
- Disable: past dates, dates in `shop_settings.blocked_dates`, slots already booked
- Query existing bookings for the selected date: `.from('bookings').select('appointment_time').eq('appointment_date', date)` — exclude these times
- Selected date: rose chip; selected time: rose chip
- Validation: both date and time picked

### Step 5 — Contact (`contact.tsx`)
- Three fields: name, phone, email
- If user is logged in, pre-fill from `profile`
- If user has booked before as guest, pre-fill from MMKV-stored last-used values
- Phone: auto-format as user types (`07834 877992` style)
- Toggle: "Save my details for next time"
- Validation: name ≥ 2 chars, UK phone, valid email

### Step 6 — Review (`review.tsx`)
- Summary card with sections:
  - Alteration: icon + label + price range
  - Photos: thumbnail row (tap to view)
  - Details: garment type + description excerpt
  - Schedule: long-form date + time
  - Contact: name, phone, email
- Each section has small "Edit" pill in top right → router.push back to that step (state preserved)
- Big primary CTA: "Confirm booking"
- Fine print: "We'll send a confirmation. Steffi will reply with a quote within 24 hours."

#### Submission flow
1. Disable button + show inline spinner ("Confirming…")
2. Move photos from `drafts/<draft-id>` to `bookings/<booking_id>` storage path
3. Insert booking row with `status='new'` and the photo paths
4. On success:
   - Trigger `send-email` Edge Function with `type='booking_confirmation'`
   - Trigger `send-email` Edge Function with `type='internal_alert'` (to Steffi)
   - If `saveDetails=true` and no session: trigger magic-link signup with the email
   - Navigate to `confirmed` screen with booking ID
   - Reset draft store
5. On failure: toast error, restore button state, do NOT lose draft

### Confirmed Screen (`confirmed.tsx`)
- Not a wizard step; remove progress bar
- Animated check-mark draw-on (400ms SVG stroke animation)
- Brand wordmark above check
- "You're booked." in Fraunces text-3xl
- Reference number (e.g. `SC-482917`) in large tabular-nums
- Booking summary card
- CTA row:
  - "Open in WhatsApp" — `wa.me/447834877992?text=Hi%20Steffi%2C%20re%3A%20booking%20SC-482917`
  - "Add to calendar" — uses `expo-calendar` to create event
- "Done" → `router.replace('/')` (home, not back to review)

## Layout & Transitions

```tsx
// app/(customer)/book/_layout.tsx
import { Stack } from 'expo-router';
export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 320,
        headerShown: false,
        gestureEnabled: true,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
```

### Progress Bar
Shared across steps as a top-of-screen component. Animates `width` based on `currentStep / 6` over 300ms with `Easing.out(Easing.cubic)`.

### Back navigation
- System back / gesture: goes to previous step, preserves all data
- Close (X) button in top-right of every step: opens confirm sheet "Discard this booking?" with haptic `warning`
  - "Discard" → reset draft + `router.dismissAll()`
  - "Keep" → close sheet

## Edge Cases (handle all)

- **Backgrounding mid-upload** — uploads pause; resume on foreground (TanStack Query will retry)
- **App crashed mid-flow** — draft restored from MMKV on next open; on home screen, if `draft` is non-empty, show "Continue your booking" card
- **Slot taken between steps 4 and 6** — re-check on submission; if taken, friendly error + bounce to schedule step
- **Network drops on submission** — show "No connection. We'll save your booking and submit when you're back online." Implement via TanStack Query mutation persistence.
- **User reaches limit (5 photos)** — disable "Add" tile with helper text "Maximum 5 photos"
- **Photo upload fails** — retry once silently; on second fail, show toast with manual retry button on the failed thumbnail

## Anti-Patterns

- ❌ Validating all steps' fields on every keystroke
- ❌ Losing data on back-navigation
- ❌ Blocking UI while photos upload
- ❌ Submitting before all uploads complete (or NOT updating UI to show this state)
- ❌ Using `Alert.alert()` for the discard confirm — use `Sheet`
- ❌ Generic "Error" toasts — always specific
- ❌ Showing all field errors on step entry
- ❌ Removing the progress bar mid-flow
- ❌ Hard-coded slot times — always derived from `shop_settings`
- ❌ Allowing booking dates more than 90 days in advance (cap it; way too far out for an alterations shop)

## When Modifying the Wizard

Before changing anything:
1. Check that the change preserves back-navigation data integrity
2. Check that draft persistence still works on app restart
3. Run through the full flow on a physical device before pushing
4. Check that the success → reset → home navigation doesn't leave stale state

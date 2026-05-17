/**
 * Steffny Couture shop details — from CLAUDE.md §0.1.
 * These are the fallback / display values. Live shop settings (hours,
 * blocked dates, slot duration) come from the `shop_settings` table once
 * the backend exists (Phase 1+); use these constants for static UI.
 */

export const shop = {
  name: 'Steffny Couture',
  legalName: 'Steffny Couture Ltd',
  address: '255 High Street, Hounslow, London TW3 1EA',
  /** Display format — see steffny-brand skill formatting rules. */
  phoneDisplay: '+44 7834 877992',
  /** Bare digits for `tel:` and `wa.me` links. */
  phoneRaw: '447834877992',
  email: 'bookings@steffnycouture.co.uk',
  instagramHandle: 'steffnycouture',
  instagramUrl: 'https://www.instagram.com/steffnycouture',
  website: 'https://www.steffnycouture.co.uk',
} as const;

/** Day keys as used by the `shop_settings.hours` JSON column. */
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** Opening hours as [open, close] in 24h "HH:mm" — from CLAUDE.md §0.1. */
export const openingHours: Record<DayKey, [string, string]> = {
  mon: ['09:30', '19:00'],
  tue: ['09:30', '19:00'],
  wed: ['09:30', '19:00'],
  thu: ['09:30', '19:00'],
  fri: ['09:30', '19:00'],
  sat: ['10:00', '19:00'],
  sun: ['11:00', '18:00'],
};

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/** Default appointment slot length in minutes. */
export const DEFAULT_SLOT_DURATION_MINUTES = 30;

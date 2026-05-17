import { addDays, format, getDay, parseISO } from 'date-fns';

import { type DayKey, DEFAULT_SLOT_DURATION_MINUTES } from '@/constants/shop';
import { nowInLondon } from '@/lib/date';

import { type ShopHours } from '@/features/bookings/types';

/**
 * Appointment-slot logic — pure functions, no React, no Supabase. Slot times
 * are always derived from the shop's opening hours, never hard-coded
 * (booking-wizard skill).
 */

/** date-fns `getDay()` is 0=Sun … 6=Sat; map each index to our `DayKey`. */
const DAY_KEYS: readonly DayKey[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

/** How far ahead a customer may book — an alterations shop never needs more. */
export const MAX_BOOKING_DAYS_AHEAD = 90;

/** The `DayKey` for a given date. */
export function dayKeyOf(date: Date): DayKey {
  return DAY_KEYS[getDay(date)] ?? 'mon';
}

/** "YYYY-MM-DD" identifier for a date. */
export function toDateId(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Today's date identifier, anchored to the shop's timezone. */
export function todayId(): string {
  return toDateId(nowInLondon());
}

/** The next `count` days starting today — backs the schedule week strip. */
export function upcomingDays(count: number): Date[] {
  const start = nowInLondon();
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

/** The latest date a customer may book — today plus the booking horizon. */
export function maxBookableDateId(): string {
  return toDateId(addDays(nowInLondon(), MAX_BOOKING_DAYS_AHEAD));
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Every slot start time ("HH:mm") the given day's opening hours allow,
 * stepping by the slot duration. Booked slots are filtered out by the caller.
 */
export function slotsForDate(
  dateId: string,
  hours: ShopHours,
  slotMinutes: number = DEFAULT_SLOT_DURATION_MINUTES,
): string[] {
  const window = hours[dayKeyOf(parseISO(dateId))];
  if (!window) return [];
  const [open, close] = window;
  const closeMin = toMinutes(close);

  const slots: string[] = [];
  for (let m = toMinutes(open); m + slotMinutes <= closeMin; m += slotMinutes) {
    slots.push(fromMinutes(m));
  }
  return slots;
}

/** Is this slot already in the past? Only ever true for today's slots. */
export function isSlotPast(dateId: string, slot: string): boolean {
  if (dateId !== todayId()) return false;
  const now = nowInLondon();
  return toMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
}

/** Has the shop blocked this whole date in `shop_settings.blocked_dates`? */
export function isDateBlocked(dateId: string, blocked: string[]): boolean {
  return blocked.includes(dateId);
}

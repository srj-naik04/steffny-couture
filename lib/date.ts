import {
  differenceInCalendarDays,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
} from 'date-fns';
import { enGB } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Date helpers — every date the customer sees passes through here.
 *
 * The studio is in Hounslow, London, so all formatting is locked to
 * `Europe/London` and the `en-GB` locale. Never call `toLocaleDateString()`
 * or `Date.now()` for display/scheduling — use these (CLAUDE.md anti-patterns).
 */

export const TIME_ZONE = 'Europe/London';

function toDate(value: Date | string): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

/** Current time as a Date anchored to the London timezone. */
export function nowInLondon(): Date {
  return toZonedTime(new Date(), TIME_ZONE);
}

/** "Wed 21 May" — lists, cards. */
export function formatShort(value: Date | string): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, 'EEE d MMM', { locale: enGB });
}

/** "Wednesday, 21 May 2026" — headers, detail screens. */
export function formatLong(value: Date | string): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, 'EEEE, d MMMM yyyy', { locale: enGB });
}

/** "2:30 PM" — formats the time portion of a Date. */
export function formatTime(value: Date | string): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, 'h:mm a', { locale: enGB });
}

/** "Wed" — short weekday, e.g. for the schedule day strip. */
export function formatWeekdayShort(value: Date | string): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, 'EEE', { locale: enGB });
}

/** "21" — day of the month. */
export function formatDayOfMonth(value: Date | string): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, 'd', { locale: enGB });
}

/** "2:30 PM" — formats a bare "HH:mm" string (e.g. an appointment slot). */
export function formatTimeLabel(hhmm: string): string {
  const parts = hhmm.split(':');
  const hours = Number(parts[0] ?? 0);
  const minutes = Number(parts[1] ?? 0);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Relative time for recent activity: "2 hours ago", "Yesterday".
 * Beyond 7 days it switches to the short date ("Wed 21 May").
 */
export function formatRelative(value: Date | string): string {
  const date = toDate(value);
  if (isYesterday(date)) return 'Yesterday';
  if (isToday(date) || Math.abs(differenceInCalendarDays(new Date(), date)) <= 7) {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: enGB });
  }
  return formatShort(date);
}

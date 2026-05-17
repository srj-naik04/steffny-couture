import { type BookingStatus } from '@/components/ui';

/**
 * Booking-status helpers — pure, no React. The DB stores `status` as free
 * `text` (checked, but typed as `string`); these narrow it and answer the
 * questions the customer screens ask of it.
 */

/** The forward lifecycle a booking moves through, in order. */
export const LIFECYCLE: readonly BookingStatus[] = [
  'new',
  'confirmed',
  'in_progress',
  'ready',
  'collected',
];

/** Human label for a status — used by the timeline and section headers. */
export const STATUS_LABEL: Record<BookingStatus, string> = {
  new: 'Booked',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  ready: 'Ready to collect',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

const ALL: readonly BookingStatus[] = [...LIFECYCLE, 'cancelled'];

/** Narrow the DB's `string` status to a known `BookingStatus`. */
export function asBookingStatus(raw: string): BookingStatus {
  return (ALL as readonly string[]).includes(raw)
    ? (raw as BookingStatus)
    : 'new';
}

/**
 * Active = still in motion (the customer is waiting on it). Past = finished
 * or cancelled. Drives the "My bookings" Active / Past split.
 */
export function isActiveStatus(raw: string): boolean {
  const status = asBookingStatus(raw);
  return status !== 'collected' && status !== 'cancelled';
}

/** True once the booking can no longer be cancelled or rescheduled. */
export function isLocked(raw: string): boolean {
  const status = asBookingStatus(raw);
  return status !== 'new' && status !== 'confirmed';
}

import { getGuestBookingIds } from '@/lib/guest-bookings';
import { supabase } from '@/lib/supabase';

import {
  type BookingRow,
  type BookingStatusHistoryRow,
} from '@/features/bookings/types';

/**
 * Customer-facing reads and writes for "My bookings" (Phase 4).
 *
 * A signed-in customer reads their bookings directly — RLS scopes the result
 * to rows they own (by `customer_id` or `guest_email`). A guest has no
 * session, so reads/writes go through the `*_guest_booking*` functions from
 * migration 007, keyed on the booking id the device remembered.
 *
 * Photos under `booking-photos` need the booking id; reading one already
 * proves the caller holds it (the id is in the path), so guests can mint
 * signed URLs for them too.
 */

const BUCKET = 'booking-photos';
/** Signed-URL lifetime — long enough for a viewing session. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Thrown when a cancel/reschedule lands on a booking past its editable window. */
export class BookingLockedError extends Error {
  constructor() {
    super('This booking can no longer be changed. Message Steffi instead.');
    this.name = 'BookingLockedError';
  }
}

/** Drop duplicate rows (a booking can match both the RLS read and the RPC). */
function dedupe(rows: BookingRow[]): BookingRow[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

/**
 * Every booking belonging to the customer: their account/email-linked rows
 * (when signed in) merged with the rows this device created as a guest.
 */
export async function fetchCustomerBookings(
  authed: boolean,
): Promise<BookingRow[]> {
  const collected: BookingRow[] = [];

  if (authed) {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw error;
    collected.push(...(data ?? []));
  }

  const guestIds = await getGuestBookingIds();
  if (guestIds.length > 0) {
    const { data, error } = await supabase.rpc('get_guest_bookings', {
      p_ids: guestIds,
    });
    if (error) throw error;
    collected.push(...(data ?? []));
  }

  return dedupe(collected);
}

/** One booking by id — works for guests and signed-in customers alike. */
export async function fetchBooking(id: string): Promise<BookingRow | null> {
  const { data, error } = await supabase.rpc('get_guest_bookings', {
    p_ids: [id],
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

/** A booking's status history (audit trail), oldest change first. */
export async function fetchBookingHistory(
  id: string,
): Promise<BookingStatusHistoryRow[]> {
  const { data, error } = await supabase.rpc('get_guest_booking_history', {
    p_id: id,
  });
  if (error) throw error;
  return data ?? [];
}

/** Cancel a booking. Throws `BookingLockedError` if it is past cancelling. */
export async function cancelBooking(id: string): Promise<BookingRow> {
  const { data, error } = await supabase.rpc('cancel_guest_booking', {
    p_id: id,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) throw new BookingLockedError();
  return row;
}

/** Move a booking to a new slot. Throws `BookingLockedError` if locked. */
export async function rescheduleBooking(
  id: string,
  dateId: string,
  time: string,
): Promise<BookingRow> {
  const { data, error } = await supabase.rpc('reschedule_guest_booking', {
    p_id: id,
    p_date: dateId,
    p_time: time,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) throw new BookingLockedError();
  return row;
}

/**
 * Signed URLs for a booking's photos. `booking-photos` is a private bucket,
 * so stored paths must be signed before they can be displayed. Paths that
 * fail to sign are dropped rather than failing the whole gallery.
 */
export async function signBookingPhotos(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  return (data ?? [])
    .map((entry) => entry.signedUrl)
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
}

import { supabase } from '@/lib/supabase';

import {
  type BookingDraft,
  type BookingInsert,
  type BookingRow,
} from '@/features/bookings/types';

/**
 * Thrown when the chosen slot was taken by someone else between the schedule
 * step and submission. The review screen catches this to bounce the customer
 * back to step 4 (booking-wizard skill, edge cases).
 */
export class SlotTakenError extends Error {
  constructor() {
    super('That time was just taken. Choose another slot.');
    this.name = 'SlotTakenError';
  }
}

/** Postgres `time` values come back as "HH:MM:SS"; the wizard works in "HH:MM". */
function normaliseTime(raw: string): string {
  return raw.slice(0, 5);
}

/** Appointment times already taken on a date — used to grey out slots. */
export async function getBookedSlots(dateId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('appointment_time')
    .eq('appointment_date', dateId)
    .neq('status', 'cancelled');

  if (error) throw error;
  return (data ?? []).map((row) => normaliseTime(row.appointment_time));
}

/** Map a completed draft to the `bookings` insert payload. */
export function draftToInsert(draft: BookingDraft): BookingInsert {
  return {
    // The id is generated up front so photos could upload to bookings/<id>/.
    id: draft.bookingId,
    customer_id: null,
    guest_name: draft.name.trim(),
    guest_phone: draft.phone.trim(),
    guest_email: draft.email.trim().toLowerCase(),
    alteration_type_id: draft.alterationTypeId,
    dress_type: draft.dressType,
    description: draft.description.trim(),
    photo_urls: draft.photos
      .filter((p) => p.status === 'uploaded' && p.remotePath)
      .map((p) => p.remotePath as string),
    appointment_date: draft.appointmentDate as string,
    appointment_time: draft.appointmentTime as string,
    status: 'new',
  };
}

/** Insert a booking and return the stored row (with its generated reference). */
export async function createBooking(
  input: BookingInsert,
): Promise<BookingRow> {
  const { data, error } = await supabase
    .from('bookings')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

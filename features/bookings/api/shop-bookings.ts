import { supabase } from '@/lib/supabase';

import {
  type BookingInsert,
  type BookingRow,
} from '@/features/bookings/types';

/**
 * Staff-side booking reads and writes for the shop dashboard (CLAUDE.md §5).
 *
 * Staff RLS (migrations 003 + 008) grants full read, update and insert, so
 * these go straight at the `bookings` table — no capability functions needed.
 */

/** Editable detail fields the shop sets on a booking. */
export type BookingFields = {
  price_quote?: number | null;
  final_price?: number | null;
  internal_notes?: string | null;
};

/** What the "new manual booking" form collects for a walk-in customer. */
export type ManualBookingInput = {
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  alterationTypeId: string;
  dressType: string | null;
  description: string;
  appointmentDate: string;
  appointmentTime: string;
  priceQuote: number | null;
  internalNotes: string | null;
};

/** Every booking, newest appointment first — staff RLS returns them all. */
export async function fetchAllBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Change a booking's status. The DB trigger logs the change to history. */
export async function updateBookingStatus(
  id: string,
  status: BookingRow['status'],
): Promise<BookingRow> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update the shop-only fields — price quote, final price, internal notes. */
export async function updateBookingFields(
  id: string,
  fields: BookingFields,
): Promise<BookingRow> {
  const { data, error } = await supabase
    .from('bookings')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Create a booking for a walk-in customer. Staff-only (migration 008). */
export async function createManualBooking(
  input: ManualBookingInput,
): Promise<BookingRow> {
  const payload: BookingInsert = {
    customer_id: null,
    guest_name: input.guestName.trim(),
    guest_phone: input.guestPhone.trim(),
    guest_email: input.guestEmail?.trim().toLowerCase() || null,
    alteration_type_id: input.alterationTypeId,
    dress_type: input.dressType,
    description: input.description.trim(),
    appointment_date: input.appointmentDate,
    appointment_time: input.appointmentTime,
    price_quote: input.priceQuote,
    internal_notes: input.internalNotes?.trim() || null,
    // A walk-in is booked in person, so it starts confirmed, not "new".
    status: 'confirmed',
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

import { toDialableDigits } from '@/lib/format';

import { type BookingRow } from '@/features/bookings';

/**
 * Customers — the shop has no customer table; a "customer" is every booking
 * that shares a phone number (or, failing that, an email). These pure
 * functions aggregate the bookings list into that view (CLAUDE.md §5.4).
 */

export type Customer = {
  /** Stable identity key — normalised phone, email, or a fallback. */
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  /** This customer's bookings, most recent appointment first. */
  bookings: BookingRow[];
  bookingCount: number;
  /** Sum of every set `final_price`. */
  totalSpend: number;
  lastBookingDate: string;
};

/** Group key for a booking — phone first, then email, then the row id. */
function identityKey(booking: BookingRow): string {
  if (booking.guest_phone) return `p:${toDialableDigits(booking.guest_phone)}`;
  if (booking.guest_email) return `e:${booking.guest_email.toLowerCase()}`;
  return `b:${booking.id}`;
}

/** Roll the bookings list up into unique customers, recent activity first. */
export function aggregateCustomers(bookings: BookingRow[]): Customer[] {
  const groups = new Map<string, BookingRow[]>();
  for (const booking of bookings) {
    const key = identityKey(booking);
    const group = groups.get(key);
    if (group) group.push(booking);
    else groups.set(key, [booking]);
  }

  return [...groups.entries()]
    .map(([key, rows]) => {
      const sorted = [...rows].sort((a, b) =>
        b.appointment_date.localeCompare(a.appointment_date),
      );
      const newest = sorted[0];
      return {
        key,
        name: sorted.find((r) => r.guest_name)?.guest_name ?? 'Customer',
        phone: sorted.find((r) => r.guest_phone)?.guest_phone ?? null,
        email: sorted.find((r) => r.guest_email)?.guest_email ?? null,
        bookings: sorted,
        bookingCount: sorted.length,
        totalSpend: sorted.reduce(
          (sum, r) => sum + (r.final_price ?? 0),
          0,
        ),
        lastBookingDate: newest?.appointment_date ?? '',
      };
    })
    .sort((a, b) => b.lastBookingDate.localeCompare(a.lastBookingDate));
}

/** A single customer by key, or `undefined` if no booking matches. */
export function findCustomer(
  bookings: BookingRow[],
  key: string,
): Customer | undefined {
  return aggregateCustomers(bookings).find((customer) => customer.key === key);
}

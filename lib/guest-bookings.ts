import * as FileSystem from 'expo-file-system/legacy';

/**
 * On-device record of the bookings made on this device.
 *
 * A guest customer (no account) has no auth session, so the Phase 1 RLS would
 * never let them read a booking back. Instead we remember each booking's id
 * here — an unguessable UUID that acts as a capability token — and the
 * "My bookings" screen fetches them through the guest-access functions added
 * in migration 007.
 *
 * Stored as a plain JSON array in the app's document directory: Expo Go-safe,
 * the same approach as the wizard draft (ADR-0007). Failures are swallowed —
 * the booking itself is always saved server-side regardless.
 */
const FILE = `${FileSystem.documentDirectory ?? ''}guest-bookings.json`;

/** Booking ids made on this device, most recent first. */
export async function getGuestBookingIds(): Promise<string[]> {
  try {
    const info = await FileSystem.getInfoAsync(FILE);
    if (!info.exists) return [];
    const parsed: unknown = JSON.parse(await FileSystem.readAsStringAsync(FILE));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

/** Record a freshly created booking so it appears in "My bookings". */
export async function rememberGuestBooking(id: string): Promise<void> {
  try {
    const existing = await getGuestBookingIds();
    if (existing.includes(id)) return;
    await FileSystem.writeAsStringAsync(
      FILE,
      JSON.stringify([id, ...existing]),
    );
  } catch {
    // Non-fatal — the booking is persisted server-side either way.
  }
}

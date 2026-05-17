import { type DayKey } from '@/constants/shop';
import { type Database } from '@/types/database';

/**
 * Booking feature types. The DB row/insert shapes are derived from the
 * generated `Database` type — never hand-written (supabase skill).
 */

export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type AlterationTypeRow =
  Database['public']['Tables']['alteration_types']['Row'];
export type ShopSettingsRow =
  Database['public']['Tables']['shop_settings']['Row'];

/** Opening hours as stored in `shop_settings.hours` (jsonb). */
export type ShopHours = Record<DayKey, [string, string]>;

/** Upload lifecycle of a single garment photo within the wizard. */
export type PhotoStatus = 'uploading' | 'uploaded' | 'error';

/**
 * A photo in the booking draft. `localUri` always points at the on-device
 * file (used for preview); `remotePath` is the Supabase Storage object path,
 * set once the upload succeeds.
 */
export type DraftPhoto = {
  id: string;
  localUri: string;
  remotePath: string | null;
  status: PhotoStatus;
};

/**
 * The whole booking the customer is assembling across the six wizard steps.
 * Held in the Zustand store and persisted so back-navigation, backgrounding
 * and a mid-flow crash never lose data (booking-wizard skill).
 */
export type BookingDraft = {
  /** Generated up front so photos upload to `bookings/<id>/` before the row exists. */
  bookingId: string;
  alterationTypeId: string | null;
  photos: DraftPhoto[];
  dressType: string | null;
  description: string;
  brand: string;
  /** ISO date (YYYY-MM-DD) the garment is needed by — optional. */
  neededBy: string | null;
  appointmentDate: string | null;
  appointmentTime: string | null;
  name: string;
  phone: string;
  email: string;
  saveDetails: boolean;
};

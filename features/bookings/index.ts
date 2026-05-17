/** Public surface of the bookings feature. Screens import only from here. */

// Draft store
export { useBookingDraft, isDraftStarted } from '@/features/bookings/store';

// Types
export type {
  BookingDraft,
  DraftPhoto,
  PhotoStatus,
  BookingRow,
  AlterationTypeRow,
  ShopSettingsRow,
  ShopHours,
} from '@/features/bookings/types';

// Schemas + validation
export {
  detailsSchema,
  contactSchema,
  typeStepSchema,
  scheduleStepSchema,
  incompleteSteps,
  UK_PHONE_REGEX,
  type DetailsValues,
  type ContactValues,
  type WizardStep,
} from '@/features/bookings/schemas';

// Slot logic
export {
  slotsForDate,
  upcomingDays,
  maxBookableDateId,
  isSlotPast,
  isDateBlocked,
  toDateId,
  todayId,
  dayKeyOf,
  MAX_BOOKING_DAYS_AHEAD,
} from '@/features/bookings/slots';

// Photo capture + upload
export {
  takePhoto,
  pickFromLibrary,
  uploadBookingPhoto,
} from '@/features/bookings/api/photos';

// Submission error
export { SlotTakenError } from '@/features/bookings/api/bookings';

// Hooks
export { useAlterationTypes } from '@/features/bookings/hooks/use-alteration-types';
export {
  useShopSettings,
  useShopHours,
} from '@/features/bookings/hooks/use-shop-settings';
export { useBookedSlots } from '@/features/bookings/hooks/use-booked-slots';
export { useSubmitBooking } from '@/features/bookings/hooks/use-submit-booking';

/** Public surface of the bookings feature. Screens import only from here. */

// Draft store
export { useBookingDraft, isDraftStarted } from '@/features/bookings/store';

// Types
export type {
  BookingDraft,
  DraftPhoto,
  PhotoStatus,
  BookingRow,
  BookingStatusHistoryRow,
  AlterationTypeRow,
  ShopSettingsRow,
  ShopHours,
} from '@/features/bookings/types';

// Status helpers
export {
  LIFECYCLE,
  STATUS_LABEL,
  asBookingStatus,
  isActiveStatus,
  isLocked,
} from '@/features/bookings/status';

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

// Submission + customer-booking errors
export { SlotTakenError } from '@/features/bookings/api/bookings';
export { BookingLockedError } from '@/features/bookings/api/customer-bookings';

// Hooks
export { useAlterationTypes } from '@/features/bookings/hooks/use-alteration-types';
export {
  useShopSettings,
  useShopHours,
} from '@/features/bookings/hooks/use-shop-settings';
export { useBookedSlots } from '@/features/bookings/hooks/use-booked-slots';
export { useSubmitBooking } from '@/features/bookings/hooks/use-submit-booking';
export { useMyBookings } from '@/features/bookings/hooks/use-my-bookings';
export { useBooking } from '@/features/bookings/hooks/use-booking';
export { useBookingHistory } from '@/features/bookings/hooks/use-booking-history';
export { useBookingPhotos } from '@/features/bookings/hooks/use-booking-photos';
export { useCancelBooking } from '@/features/bookings/hooks/use-cancel-booking';
export { useRescheduleBooking } from '@/features/bookings/hooks/use-reschedule-booking';

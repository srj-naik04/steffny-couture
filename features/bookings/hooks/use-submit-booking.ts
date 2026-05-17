import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rememberGuestBooking } from '@/lib/guest-bookings';

import { signUpWithMagicLink } from '@/features/auth';
import {
  createBooking,
  draftToInsert,
  getBookedSlots,
  SlotTakenError,
} from '@/features/bookings/api/bookings';
import { bookingKeys } from '@/features/bookings/queries';
import { type BookingDraft, type BookingRow } from '@/features/bookings/types';

/**
 * Submit a completed draft as a booking (booking-wizard skill, §3.2 step 6).
 *
 * Re-checks the slot first — it may have been taken between the schedule step
 * and now — then inserts the row. When the customer opted to save their
 * details, a magic-link account is started (non-fatal if it fails). The
 * confirmation emails are deferred with the rest of the email work.
 */
export function useSubmitBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingRow, Error, BookingDraft>({
    mutationFn: async (draft) => {
      if (draft.appointmentDate && draft.appointmentTime) {
        const taken = await getBookedSlots(draft.appointmentDate);
        if (taken.includes(draft.appointmentTime)) throw new SlotTakenError();
      }

      const booking = await createBooking(draftToInsert(draft));

      // Remember the booking on this device so it shows in "My bookings" —
      // a guest has no session to read it back any other way (migration 007).
      await rememberGuestBooking(booking.id);

      if (draft.saveDetails) {
        try {
          await signUpWithMagicLink({
            email: draft.email,
            fullName: draft.name,
            phone: draft.phone,
          });
        } catch {
          // Non-fatal — the booking is already saved.
        }
      }

      // TODO(phase-1-email): once the send-email Edge Function ships, trigger
      // `booking_confirmation` (to the customer) and `internal_alert` (to
      // Steffi) here. Deferred with the rest of the email work — see PROGRESS.md.

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

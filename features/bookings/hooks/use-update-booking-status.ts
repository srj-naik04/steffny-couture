import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateBookingStatus } from '@/features/bookings/api/shop-bookings';
import { bookingKeys } from '@/features/bookings/queries';
import { type BookingRow } from '@/features/bookings/types';

type StatusInput = { id: string; status: BookingRow['status'] };

/**
 * Move a booking to a new status (shop side). The DB trigger logs the change
 * to `booking_status_history`; the customer's detail screen picks it up over
 * Realtime.
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation<BookingRow, Error, StatusInput>({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking);
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });

      // TODO(phase-1-email): once the send-email Edge Function ships, fire the
      // matching template here — `status_update` for confirmed/in_progress/
      // cancelled, `dress_ready` for ready. Deferred with the email work
      // (CLAUDE.md §1.5 / §6); see PROGRESS.md.
    },
  });
}

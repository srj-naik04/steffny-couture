import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/lib/toast';

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
      toast.success('Status updated');

      // Status emails/push fire from a DB trigger -> Edge Function once the
      // send-email/send-push functions are deployed (CLAUDE.md §1.5 / §6);
      // see PROGRESS.md. The notifications table is populated already.
    },
    onError: () => toast.error('Couldn’t update the status'),
  });
}

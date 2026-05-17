import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/lib/toast';

import { cancelBooking } from '@/features/bookings/api/customer-bookings';
import { bookingKeys } from '@/features/bookings/queries';
import { type BookingRow } from '@/features/bookings/types';

/**
 * Cancel a booking. The detail cache is updated from the returned row and
 * every booking query is invalidated so the list, history and freed-up slot
 * all reflect the change.
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingRow, Error, string>({
    mutationFn: cancelBooking,
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking);
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success('Booking cancelled');
    },
  });
}

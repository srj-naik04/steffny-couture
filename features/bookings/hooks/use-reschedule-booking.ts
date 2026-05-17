import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/lib/toast';

import { rescheduleBooking } from '@/features/bookings/api/customer-bookings';
import { bookingKeys } from '@/features/bookings/queries';
import { type BookingRow } from '@/features/bookings/types';

type RescheduleInput = { id: string; dateId: string; time: string };

/**
 * Move a booking to a new appointment slot. Invalidates every booking query
 * so the list, the detail and both the old and new dates' slot availability
 * are refreshed.
 */
export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingRow, Error, RescheduleInput>({
    mutationFn: ({ id, dateId, time }) =>
      rescheduleBooking(id, dateId, time),
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking);
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success('Appointment moved');
    },
    onError: () => toast.error('Couldn’t reschedule — try another time'),
  });
}

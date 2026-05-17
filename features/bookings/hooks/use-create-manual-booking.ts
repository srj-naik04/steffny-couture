import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createManualBooking,
  type ManualBookingInput,
} from '@/features/bookings/api/shop-bookings';
import { bookingKeys } from '@/features/bookings/queries';
import { type BookingRow } from '@/features/bookings/types';

/** Create a walk-in booking from the shop's "new manual booking" form. */
export function useCreateManualBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingRow, Error, ManualBookingInput>({
    mutationFn: createManualBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

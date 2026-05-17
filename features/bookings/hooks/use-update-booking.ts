import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/lib/toast';

import {
  type BookingFields,
  updateBookingFields,
} from '@/features/bookings/api/shop-bookings';
import { bookingKeys } from '@/features/bookings/queries';
import { type BookingRow } from '@/features/bookings/types';

type UpdateInput = { id: string; fields: BookingFields };

/** Update a booking's shop-only fields — price quote, final price, notes. */
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingRow, Error, UpdateInput>({
    mutationFn: ({ id, fields }) => updateBookingFields(id, fields),
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking);
      void queryClient.invalidateQueries({ queryKey: bookingKeys.shopList() });
    },
    // Field edits save on blur — a success toast each time would be noise, so
    // only failures speak up.
    onError: () => toast.error('Couldn’t save — check your connection'),
  });
}

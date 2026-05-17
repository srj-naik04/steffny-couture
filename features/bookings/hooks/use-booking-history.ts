import { useQuery } from '@tanstack/react-query';

import { fetchBookingHistory } from '@/features/bookings/api/customer-bookings';
import { bookingKeys } from '@/features/bookings/queries';

/** A booking's status history — powers the detail screen's timeline. */
export function useBookingHistory(id: string) {
  return useQuery({
    queryKey: bookingKeys.history(id),
    queryFn: () => fetchBookingHistory(id),
    staleTime: 15_000,
  });
}

import { useQuery } from '@tanstack/react-query';

import { getBookedSlots } from '@/features/bookings/api/bookings';
import { bookingKeys } from '@/features/bookings/queries';

/**
 * Appointment times already taken on a date, so the schedule step can grey
 * them out. Disabled until a date is chosen.
 */
export function useBookedSlots(dateId: string | null) {
  return useQuery({
    queryKey: bookingKeys.bookedSlots(dateId ?? 'none'),
    queryFn: () => getBookedSlots(dateId as string),
    enabled: !!dateId,
    staleTime: 30_000,
  });
}

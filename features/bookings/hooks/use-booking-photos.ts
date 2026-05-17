import { useQuery } from '@tanstack/react-query';

import { signBookingPhotos } from '@/features/bookings/api/customer-bookings';
import { bookingKeys } from '@/features/bookings/queries';

/**
 * Signed, displayable URLs for a booking's photos. `booking-photos` is a
 * private bucket, so the stored object paths have to be signed first. Cached
 * just under the signed-URL lifetime so links are refreshed before they
 * expire.
 */
export function useBookingPhotos(id: string, paths: string[] | undefined) {
  return useQuery({
    queryKey: bookingKeys.photos(id),
    queryFn: () => signBookingPhotos(paths ?? []),
    enabled: paths !== undefined && paths.length > 0,
    staleTime: 50 * 60_000,
  });
}

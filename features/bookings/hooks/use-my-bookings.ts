import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';
import { fetchCustomerBookings } from '@/features/bookings/api/customer-bookings';
import { bookingKeys } from '@/features/bookings/queries';

/**
 * The customer's "My bookings" list. A signed-in customer's account/email
 * bookings are merged with the guest bookings made on this device; the query
 * key is scoped so the two never share a cache entry.
 */
export function useMyBookings() {
  const { session } = useAuth();
  const authed = !!session;

  return useQuery({
    queryKey: bookingKeys.list(authed ? 'me' : 'guest'),
    queryFn: () => fetchCustomerBookings(authed),
    staleTime: 30_000,
  });
}

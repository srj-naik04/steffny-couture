import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

import { fetchAllBookings } from '@/features/bookings/api/shop-bookings';
import { bookingKeys } from '@/features/bookings/queries';

/**
 * Every booking, for the shop dashboard. A Realtime subscription on the
 * `bookings` table keeps the list, kanban and calendar live as bookings come
 * in and statuses change — Steffi never has to pull to refresh.
 */
export function useShopBookings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: bookingKeys.shopList(),
    queryFn: fetchAllBookings,
    staleTime: 20_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('shop-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

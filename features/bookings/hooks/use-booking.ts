import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

import { fetchBooking } from '@/features/bookings/api/customer-bookings';
import { bookingKeys } from '@/features/bookings/queries';

/**
 * One booking's detail, kept live.
 *
 * A Realtime subscription on the row refetches the detail and its history the
 * moment the shop changes anything — so a status update lands without the
 * customer touching the screen. Realtime is delivered through RLS, so it
 * reaches signed-in customers; guests additionally get a refetch whenever the
 * detail screen regains focus (see the screen's `useFocusEffect`).
 *
 * Pass `realtime: false` for a read that only needs the cached row (e.g. the
 * reschedule modal stacked over the detail) so the channel isn't opened twice.
 */
export function useBooking(id: string, options?: { realtime?: boolean }) {
  const realtime = options?.realtime ?? true;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetchBooking(id),
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!realtime) return;

    const channel = supabase
      .channel(`booking-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${id}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: bookingKeys.detail(id),
          });
          void queryClient.invalidateQueries({
            queryKey: bookingKeys.history(id),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, queryClient, realtime]);

  return query;
}

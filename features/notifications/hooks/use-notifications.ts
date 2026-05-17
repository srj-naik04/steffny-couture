import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

import { useAuth } from '@/features/auth';
import { fetchNotifications } from '@/features/notifications/api/notifications';
import { notificationKeys } from '@/features/notifications/queries';
import { type NotificationAudience } from '@/features/notifications/types';

/**
 * The current viewer's notifications. Staff get the shop feed (kept live over
 * Realtime); customers get their own, refetched whenever the notification
 * centre is opened (guests have no session for Realtime).
 */
export function useNotifications() {
  const { isStaff } = useAuth();
  const audience: NotificationAudience = isStaff ? 'shop' : 'customer';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: notificationKeys.list(audience),
    queryFn: () => fetchNotifications(audience),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (audience !== 'shop') return;
    const channel = supabase
      .channel('notifications-shop')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          void queryClient.invalidateQueries({
            queryKey: notificationKeys.all,
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [audience, queryClient]);

  return { ...query, audience };
}

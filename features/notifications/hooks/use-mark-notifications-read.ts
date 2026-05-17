import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markNotificationsRead } from '@/features/notifications/api/notifications';
import { notificationKeys } from '@/features/notifications/queries';
import { type NotificationAudience } from '@/features/notifications/types';

/** Mark every unread notification for an audience as read. */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, NotificationAudience>({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/** Public surface of the notifications feature. */
export { useNotifications } from '@/features/notifications/hooks/use-notifications';
export { useMarkNotificationsRead } from '@/features/notifications/hooks/use-mark-notifications-read';
export { registerForPushNotifications } from '@/features/notifications/api/push';
export type {
  NotificationRow,
  NotificationAudience,
} from '@/features/notifications/types';

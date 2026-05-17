import { type Database } from '@/types/database';

/** A single in-app notification row (migration 009). */
export type NotificationRow =
  Database['public']['Tables']['notifications']['Row'];

/** Who a notification is for — drives where it is read from. */
export type NotificationAudience = 'customer' | 'shop';

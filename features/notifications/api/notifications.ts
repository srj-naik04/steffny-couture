import { getGuestBookingIds } from '@/lib/guest-bookings';
import { supabase } from '@/lib/supabase';

import {
  type NotificationAudience,
  type NotificationRow,
} from '@/features/notifications/types';

/**
 * Notification reads and mark-as-read.
 *
 * Staff read shop notifications straight from the table (staff RLS). A
 * customer has no session, so customer notifications come through the
 * migration-009 guest functions, keyed on the booking ids the device
 * remembers (the same capability model as the rest of the customer flow).
 */

/** Most recent notifications for the given audience. */
export async function fetchNotifications(
  audience: NotificationAudience,
): Promise<NotificationRow[]> {
  if (audience === 'shop') {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('audience', 'shop')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  }

  const bookingIds = await getGuestBookingIds();
  if (bookingIds.length === 0) return [];
  const { data, error } = await supabase.rpc('get_guest_notifications', {
    p_booking_ids: bookingIds,
  });
  if (error) throw error;
  return data ?? [];
}

/** Mark every unread notification for the audience as read. */
export async function markNotificationsRead(
  audience: NotificationAudience,
): Promise<void> {
  if (audience === 'shop') {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('audience', 'shop')
      .is('read_at', null);
    if (error) throw error;
    return;
  }

  const bookingIds = await getGuestBookingIds();
  if (bookingIds.length === 0) return;
  const { error } = await supabase.rpc('mark_guest_notifications_read', {
    p_booking_ids: bookingIds,
  });
  if (error) throw error;
}

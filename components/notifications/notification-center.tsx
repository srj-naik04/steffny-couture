import { Bell } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { PressableScale, Sheet, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { formatRelative } from '@/lib/date';

import {
  type NotificationRow,
  useMarkNotificationsRead,
  useNotifications,
} from '@/features/notifications';

/** One notification row inside the centre. */
function NotificationItem({ item }: { item: NotificationRow }) {
  return (
    <View className="flex-row gap-3 border-b border-border py-3">
      <View
        className={`mt-1.5 h-2 w-2 rounded-full ${
          item.read_at ? 'bg-transparent' : 'bg-rose'
        }`}
      />
      <View className="flex-1 gap-0.5">
        <Text variant="body" className="font-body-semibold">
          {item.title}
        </Text>
        <Text variant="secondary" className="text-inkMuted">
          {item.body}
        </Text>
        <Text variant="caption" className="text-inkSubtle">
          {formatRelative(item.created_at)}
        </Text>
      </View>
    </View>
  );
}

/**
 * The notification centre — a bell with an unread badge that opens a sheet of
 * recent notifications (CLAUDE.md §6.2). Opening it marks everything read.
 * Dropped into the customer welcome and shop dashboard headers.
 */
export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data, audience } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read_at).length;

  const onOpen = () => {
    setOpen(true);
    if (unread > 0) markRead.mutate(audience);
  };

  return (
    <>
      <PressableScale
        haptic="selection"
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
        }
        className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt">
        <Bell size={19} color={colors.ink} strokeWidth={2} />
        {unread > 0 ? (
          <View className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1">
            <Text variant="caption" className="text-ivory">
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        ) : null}
      </PressableScale>

      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Notifications">
        {notifications.length === 0 ? (
          <Text variant="body" className="pb-3 text-inkMuted">
            No notifications yet. Updates on your bookings will appear here.
          </Text>
        ) : (
          <ScrollView
            className="max-h-96"
            showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <NotificationItem key={item.id} item={item} />
            ))}
          </ScrollView>
        )}
      </Sheet>
    </>
  );
}

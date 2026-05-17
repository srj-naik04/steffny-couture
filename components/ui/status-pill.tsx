import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Booking lifecycle status — mirrors the `bookings.status` DB check. */
export type BookingStatus =
  | 'new'
  | 'confirmed'
  | 'in_progress'
  | 'ready'
  | 'collected'
  | 'cancelled';

const CONTAINER: Record<BookingStatus, string> = {
  new: 'bg-roseSoft',
  confirmed: 'bg-info/10',
  in_progress: 'bg-goldSoft',
  ready: 'bg-success/10',
  collected: 'bg-border',
  cancelled: 'bg-danger/10',
};

const LABEL_COLOUR: Record<BookingStatus, string> = {
  new: 'text-rose',
  confirmed: 'text-info',
  in_progress: 'text-warning',
  ready: 'text-success',
  collected: 'text-inkMuted',
  cancelled: 'text-danger',
};

const LABEL: Record<BookingStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  ready: 'Ready',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

/** Tonal status indicator — colour-mapped pill for a booking's status. */
export function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <View className={`self-start rounded-full px-3 py-1 ${CONTAINER[status]}`}>
      <Text
        variant="caption"
        className={`uppercase ${LABEL_COLOUR[status]}`}
        accessibilityLabel={`Status: ${LABEL[status]}`}>
        {LABEL[status]}
      </Text>
    </View>
  );
}

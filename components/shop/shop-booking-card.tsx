import { View } from 'react-native';

import { Card, StatusPill, Text } from '@/components/ui';
import { ALTERATION_TYPES } from '@/constants/alteration-types';
import { formatShort, formatTimeLabel } from '@/lib/date';

import { asBookingStatus, type BookingRow } from '@/features/bookings';

type Props = {
  booking: BookingRow;
  onPress: () => void;
  /** Show the appointment date under the time (off for same-day lists). */
  showDate?: boolean;
};

/** A booking row for the shop's Today list and bookings list view. */
export function ShopBookingCard({ booking, onPress, showDate = false }: Props) {
  const type = ALTERATION_TYPES.find(
    (entry) => entry.id === booking.alteration_type_id,
  );

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${booking.guest_name ?? 'Customer'}, ${
        type?.label ?? 'alteration'
      }, booking ${booking.reference}`}>
      <View className="flex-row items-center gap-3">
        <View className="w-16 items-center">
          <Text variant="bodyLg" className="text-rose">
            {formatTimeLabel(booking.appointment_time)}
          </Text>
          {showDate ? (
            <Text variant="caption" className="text-inkSubtle">
              {formatShort(booking.appointment_date)}
            </Text>
          ) : null}
        </View>
        <View className="h-10 w-px bg-border" />
        <View className="flex-1 gap-0.5">
          <Text variant="bodyLg" numberOfLines={1}>
            {booking.guest_name ?? 'Customer'}
          </Text>
          <Text variant="secondary" className="text-inkMuted" numberOfLines={1}>
            {type?.label ?? 'Alteration'} · {booking.reference}
          </Text>
        </View>
        <StatusPill status={asBookingStatus(booking.status)} />
      </View>
    </Card>
  );
}

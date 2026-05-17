import { ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, StatusPill, Text } from '@/components/ui';
import { ALTERATION_TYPES } from '@/constants/alteration-types';
import { colors } from '@/constants/brand';
import { alterationIcon } from '@/lib/alteration-icons';
import { formatShort, formatTimeLabel } from '@/lib/date';

import { asBookingStatus, type BookingRow } from '@/features/bookings';

type Props = {
  booking: BookingRow;
  onPress: () => void;
};

/**
 * A booking summary row for the customer's "My bookings" list — alteration
 * type, reference, appointment and a status pill.
 */
export function BookingCard({ booking, onPress }: Props) {
  const type = ALTERATION_TYPES.find(
    (entry) => entry.id === booking.alteration_type_id,
  );
  const Icon = alterationIcon(type?.icon);
  const label = type?.label ?? 'Alteration';

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${label}, booking ${booking.reference}`}>
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-surfaceAlt">
          <Icon size={20} color={colors.rose} strokeWidth={1.75} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text variant="bodyLg">{label}</Text>
          <Text variant="caption" className="tracking-wide text-inkSubtle">
            {booking.reference}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text variant="secondary" className="text-inkMuted">
          {formatShort(booking.appointment_date)} ·{' '}
          {formatTimeLabel(booking.appointment_time)}
        </Text>
        <StatusPill status={asBookingStatus(booking.status)} />
      </View>
    </Card>
  );
}

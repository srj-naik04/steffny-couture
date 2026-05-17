import { ScrollView } from 'react-native';

import { PressableScale, Text } from '@/components/ui';
import { formatDayOfMonth, formatWeekdayShort } from '@/lib/date';

import { isDateBlocked, toDateId, upcomingDays } from '@/features/bookings';

type Props = {
  selectedDateId: string | null;
  blockedDates: string[];
  onSelect: (dateId: string) => void;
};

/** Horizontal 14-day quick picker for the schedule step. */
export function DayStrip({ selectedDateId, blockedDates, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pr-1">
      {upcomingDays(14).map((day) => {
        const id = toDateId(day);
        const blocked = isDateBlocked(id, blockedDates);
        const selected = id === selectedDateId;
        return (
          <PressableScale
            key={id}
            haptic={blocked ? 'none' : 'selection'}
            disabled={blocked}
            onPress={() => onSelect(id)}
            accessibilityRole="button"
            accessibilityLabel={`${formatWeekdayShort(day)} ${formatDayOfMonth(day)}`}
            accessibilityState={{ selected, disabled: blocked }}
            className={`w-16 items-center gap-1 rounded-2xl border py-3 ${
              selected
                ? 'border-rose bg-rose'
                : 'border-borderStrong bg-surface'
            } ${blocked ? 'opacity-30' : ''}`}>
            <Text
              variant="caption"
              className={selected ? 'text-ivory' : 'text-inkMuted'}>
              {formatWeekdayShort(day)}
            </Text>
            <Text
              variant="title"
              className={selected ? 'text-ivory' : 'text-ink'}>
              {formatDayOfMonth(day)}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

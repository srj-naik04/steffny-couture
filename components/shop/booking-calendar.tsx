import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { PressableScale, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { nowInLondon } from '@/lib/date';

import { toDateId } from '@/features/bookings';

const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = {
  /** How many bookings fall on each date id ("YYYY-MM-DD"). */
  countsByDate: Record<string, number>;
  onSelectDay: (dateId: string) => void;
};

/** date-fns `getDay()` is 0=Sun … 6=Sat → a Monday-first column index. */
function mondayIndex(date: Date): number {
  return (getDay(date) + 6) % 7;
}

/**
 * Month overview for the shop — every day with bookings shows a rose dot;
 * tapping a day surfaces that day's bookings (CLAUDE.md §5.2).
 */
export function BookingCalendar({ countsByDate, onSelectDay }: Props) {
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(nowInLondon()),
  );

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });
  const leadingBlanks = days[0] ? mondayIndex(days[0]) : 0;
  const todayKey = toDateId(nowInLondon());

  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <PressableScale
          haptic="selection"
          onPress={() => setViewMonth(subMonths(viewMonth, 1))}
          accessibilityLabel="Previous month"
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
          <ChevronLeft size={18} color={colors.ink} strokeWidth={2} />
        </PressableScale>
        <Text variant="title">{format(viewMonth, 'MMMM yyyy')}</Text>
        <PressableScale
          haptic="selection"
          onPress={() => setViewMonth(addMonths(viewMonth, 1))}
          accessibilityLabel="Next month"
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
          <ChevronRight size={18} color={colors.ink} strokeWidth={2} />
        </PressableScale>
      </View>

      <View className="flex-row">
        {WEEKDAY_INITIALS.map((initial, index) => (
          <View key={index} className="flex-1 items-center">
            <Text variant="caption" className="text-inkSubtle">
              {initial}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <View key={`blank-${i}`} className="h-12 w-[14.28%]" />
        ))}
        {days.map((day) => {
          const id = toDateId(day);
          const count = countsByDate[id] ?? 0;
          const isToday = id === todayKey;
          return (
            <View key={id} className="h-12 w-[14.28%] items-center">
              <PressableScale
                haptic="selection"
                onPress={() => onSelectDay(id)}
                accessibilityLabel={`${format(day, 'EEEE d MMMM')}${
                  count > 0 ? `, ${count} booking${count === 1 ? '' : 's'}` : ''
                }`}
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  isToday ? 'border border-borderStrong' : ''
                }`}>
                <Text
                  variant="secondary"
                  className={`font-body-medium ${isToday ? 'text-rose' : 'text-ink'}`}>
                  {format(day, 'd')}
                </Text>
                {count > 0 ? (
                  <View className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-rose" />
                ) : null}
              </PressableScale>
            </View>
          );
        })}
      </View>
    </View>
  );
}

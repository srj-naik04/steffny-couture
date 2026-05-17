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
  /** Currently selected date ("YYYY-MM-DD"), or null. */
  selected: string | null;
  onSelect: (dateId: string) => void;
  /** Dates before this id are disabled. */
  minDateId?: string;
  /** Dates after this id are disabled. */
  maxDateId?: string;
  /** Individually disabled dates (e.g. shop-blocked days). */
  blockedDateIds?: string[];
};

/** date-fns `getDay()` is 0=Sun … 6=Sat → a Monday-first column index. */
function mondayIndex(date: Date): number {
  return (getDay(date) + 6) % 7;
}

/**
 * Month-grid date picker. Used both for the booking's "needed by" date and
 * the schedule step's full-calendar view.
 */
export function MonthCalendar({
  selected,
  onSelect,
  minDateId,
  maxDateId,
  blockedDateIds = [],
}: Props) {
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected ? new Date(selected) : nowInLondon()),
  );

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });
  const leadingBlanks = days[0] ? mondayIndex(days[0]) : 0;
  const todayKey = toDateId(nowInLondon());

  const isDisabled = (id: string): boolean =>
    (minDateId !== undefined && id < minDateId) ||
    (maxDateId !== undefined && id > maxDateId) ||
    blockedDateIds.includes(id);

  return (
    <View className="gap-3">
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
          <View key={`blank-${i}`} className="h-11 w-[14.28%]" />
        ))}
        {days.map((day) => {
          const id = toDateId(day);
          const disabled = isDisabled(id);
          const isSelected = id === selected;
          const isToday = id === todayKey;
          return (
            <View
              key={id}
              className="h-11 w-[14.28%] items-center justify-center">
              <PressableScale
                haptic={disabled ? 'none' : 'selection'}
                disabled={disabled}
                onPress={() => onSelect(id)}
                accessibilityLabel={format(day, 'EEEE d MMMM')}
                accessibilityState={{ selected: isSelected, disabled }}
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isSelected ? 'bg-rose' : ''
                } ${isToday && !isSelected ? 'border border-borderStrong' : ''}`}>
                <Text
                  variant="secondary"
                  className={`font-body-medium ${
                    isSelected
                      ? 'text-ivory'
                      : disabled
                        ? 'text-inkSubtle'
                        : 'text-ink'
                  } ${disabled ? 'opacity-40' : ''}`}>
                  {format(day, 'd')}
                </Text>
              </PressableScale>
            </View>
          );
        })}
      </View>
    </View>
  );
}

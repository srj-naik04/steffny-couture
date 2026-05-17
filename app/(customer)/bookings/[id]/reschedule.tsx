import { router, useLocalSearchParams } from 'expo-router';
import { TriangleAlert, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { DayStrip } from '@/components/booking/day-strip';
import { MonthCalendar } from '@/components/booking/month-calendar';
import {
  Box,
  Button,
  Card,
  Chip,
  EmptyState,
  PressableScale,
  Screen,
  Sheet,
  Skeleton,
  Text,
} from '@/components/ui';
import { colors } from '@/constants/brand';
import { formatLong, formatTimeLabel } from '@/lib/date';

import {
  isSlotPast,
  maxBookableDateId,
  slotsForDate,
  todayId,
  useBookedSlots,
  useBooking,
  useRescheduleBooking,
  useShopHours,
} from '@/features/bookings';

/** Postgres `time` is "HH:MM:SS"; the slot logic works in "HH:MM". */
function toSlot(time: string): string {
  return time.slice(0, 5);
}

/**
 * Reschedule a booking — the booking-wizard's schedule step, reused for an
 * existing booking (CLAUDE.md Phase 4). Presented as a modal over the detail.
 */
export default function RescheduleBooking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = id ?? '';

  // No Realtime here — the detail screen below already owns that channel.
  const booking = useBooking(bookingId, { realtime: false });
  const reschedule = useRescheduleBooking();
  const { hours, slotMinutes, blockedDates } = useShopHours();

  const [dateId, setDateId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const seeded = useRef(false);

  // Seed the picker with the booking's current slot — once.
  useEffect(() => {
    if (!seeded.current && booking.data) {
      seeded.current = true;
      setDateId(booking.data.appointment_date);
      setTime(toSlot(booking.data.appointment_time));
    }
  }, [booking.data]);

  const { data: bookedSlots } = useBookedSlots(dateId);

  if (booking.isLoading) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Box className="gap-4 pt-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </Box>
      </Screen>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <Screen edges={['top', 'bottom']}>
        <EmptyState
          icon={<TriangleAlert size={28} color={colors.rose} strokeWidth={1.75} />}
          title="Couldn't load this booking"
          body="Close this and try again from your bookings."
          cta={{ label: 'Close', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const current = {
    date: booking.data.appointment_date,
    time: toSlot(booking.data.appointment_time),
  };

  const selectDate = (next: string) => {
    if (next !== dateId) {
      setDateId(next);
      setTime(null);
    }
  };

  const slots = dateId
    ? slotsForDate(dateId, hours, slotMinutes).filter(
        (slot) => !isSlotPast(dateId, slot),
      )
    : [];
  // The booking's own current slot isn't "taken" as far as it's concerned.
  const ownSlot = dateId === current.date ? current.time : null;
  const taken = (bookedSlots ?? []).filter((slot) => slot !== ownSlot);

  const changed = dateId !== current.date || time !== current.time;
  const canSave = !!dateId && !!time && changed;

  const onSave = () => {
    if (!dateId || !time) return;
    reschedule.mutate(
      { id: bookingId, dateId, time },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen scroll edges={['top', 'bottom']} className="pb-6">
      <Box className="flex-row items-center justify-between pb-2 pt-2">
        <Text variant="section">Reschedule</Text>
        <PressableScale
          haptic="selection"
          onPress={() => router.back()}
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
          <X size={20} color={colors.ink} strokeWidth={2} />
        </PressableScale>
      </Box>

      <Card className="mt-2 gap-1 border-roseSoft bg-roseSoft">
        <Text variant="caption" className="uppercase text-rose">
          Currently booked
        </Text>
        <Text variant="body" className="font-body-medium">
          {formatLong(current.date)}
        </Text>
        <Text variant="body" className="text-inkMuted">
          {formatTimeLabel(current.time)}
        </Text>
      </Card>

      <Box className="mt-6">
        <DayStrip
          selectedDateId={dateId}
          blockedDates={blockedDates}
          onSelect={selectDate}
        />
        <PressableScale
          haptic="selection"
          onPress={() => setCalendarOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="See the full calendar"
          className="mt-3 self-start py-1">
          <Text variant="secondary" className="font-body-medium text-rose">
            See full calendar
          </Text>
        </PressableScale>
      </Box>

      {dateId ? (
        <Box className="mt-6 gap-3">
          <Text variant="title">Available times</Text>
          {slots.length === 0 ? (
            <Text variant="body" className="text-inkMuted">
              No times available that day. Try another.
            </Text>
          ) : (
            <Box className="flex-row flex-wrap gap-2">
              {slots.map((slot) => {
                const isTaken = taken.includes(slot);
                return (
                  <Chip
                    key={slot}
                    label={formatTimeLabel(slot)}
                    selected={slot === time}
                    disabled={isTaken}
                    onPress={() => setTime(slot)}
                    accessibilityLabel={`${formatTimeLabel(slot)}${isTaken ? ', booked' : ''}`}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      ) : null}

      {reschedule.isError ? (
        <View className="mt-5 flex-row items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5">
          <TriangleAlert size={16} color={colors.danger} strokeWidth={2} />
          <Text variant="secondary" className="flex-1 text-danger">
            {reschedule.error.message}
          </Text>
        </View>
      ) : null}

      <Box className="mt-7">
        <Button
          label="Save new time"
          size="lg"
          onPress={onSave}
          loading={reschedule.isPending}
          disabled={!canSave}
        />
      </Box>

      <Sheet
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="Choose a date">
        <Box className="pb-1">
          <MonthCalendar
            selected={dateId}
            minDateId={todayId()}
            maxDateId={maxBookableDateId()}
            blockedDateIds={blockedDates}
            onSelect={(next) => {
              selectDate(next);
              setCalendarOpen(false);
            }}
          />
        </Box>
      </Sheet>
    </Screen>
  );
}

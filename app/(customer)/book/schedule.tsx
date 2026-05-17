import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { DayStrip } from '@/components/booking/day-strip';
import { MonthCalendar } from '@/components/booking/month-calendar';
import { WizardStep } from '@/components/booking/wizard-step';
import { Box, Button, Chip, PressableScale, Sheet, Text } from '@/components/ui';
import { formatTimeLabel } from '@/lib/date';

import {
  isSlotPast,
  maxBookableDateId,
  slotsForDate,
  todayId,
  useBookedSlots,
  useBookingDraft,
  useShopHours,
} from '@/features/bookings';

/**
 * Step 4 — appointment slot. A 14-day strip for quick picks plus a full
 * calendar; slot times are derived from the shop's opening hours and
 * already-booked slots are greyed out (booking-wizard skill).
 */
export default function ScheduleStep() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === '1';

  const appointmentDate = useBookingDraft((s) => s.draft.appointmentDate);
  const appointmentTime = useBookingDraft((s) => s.draft.appointmentTime);
  const patch = useBookingDraft((s) => s.patch);
  const setField = useBookingDraft((s) => s.setField);

  const { hours, slotMinutes, blockedDates } = useShopHours();
  const { data: bookedSlots } = useBookedSlots(appointmentDate);
  const [calendarOpen, setCalendarOpen] = useState(false);

  /** Changing the date invalidates any time already chosen. */
  const selectDate = (dateId: string) => {
    if (dateId !== appointmentDate) {
      patch({ appointmentDate: dateId, appointmentTime: null });
    }
  };

  const slots = appointmentDate
    ? slotsForDate(appointmentDate, hours, slotMinutes).filter(
        (slot) => !isSlotPast(appointmentDate, slot),
      )
    : [];
  const taken = bookedSlots ?? [];
  const canContinue = !!appointmentDate && !!appointmentTime;

  const onNext = () => {
    if (isEditing) router.navigate('/book/review');
    else router.push('/book/contact');
  };

  return (
    <WizardStep
      step={4}
      footer={
        <Button
          label={isEditing ? 'Save changes' : 'Next'}
          size="lg"
          onPress={onNext}
          disabled={!canContinue}
        />
      }>
      <Box className="gap-1.5">
        <Text variant="hero">Pick a time</Text>
        <Text variant="body" className="text-inkMuted">
          Choose a day and a slot that suits you at our Hounslow studio.
        </Text>
      </Box>

      <Box className="mt-6">
        <DayStrip
          selectedDateId={appointmentDate}
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

      {appointmentDate ? (
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
                    selected={slot === appointmentTime}
                    disabled={isTaken}
                    onPress={() => setField('appointmentTime', slot)}
                    accessibilityLabel={`${formatTimeLabel(slot)}${isTaken ? ', booked' : ''}`}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      ) : null}

      <Sheet
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="Choose a date">
        <Box className="pb-1">
          <MonthCalendar
            selected={appointmentDate}
            minDateId={todayId()}
            maxDateId={maxBookableDateId()}
            blockedDateIds={blockedDates}
            onSelect={(id) => {
              selectDate(id);
              setCalendarOpen(false);
            }}
          />
        </Box>
      </Sheet>
    </WizardStep>
  );
}

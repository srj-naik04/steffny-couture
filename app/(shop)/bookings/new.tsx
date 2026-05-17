import { router } from 'expo-router';
import { TriangleAlert, X } from 'lucide-react-native';
import { useState } from 'react';

import { DayStrip } from '@/components/booking/day-strip';
import { MonthCalendar } from '@/components/booking/month-calendar';
import {
  Box,
  Button,
  Chip,
  Input,
  PressableScale,
  Screen,
  Select,
  Sheet,
  Text,
  Textarea,
} from '@/components/ui';
import { ALTERATION_TYPES, DRESS_TYPES } from '@/constants/alteration-types';
import { colors } from '@/constants/brand';
import { formatTimeLabel } from '@/lib/date';

import {
  isSlotPast,
  maxBookableDateId,
  slotsForDate,
  todayId,
  UK_PHONE_REGEX,
  useBookedSlots,
  useCreateManualBooking,
  useShopHours,
} from '@/features/bookings';

const TYPE_OPTIONS = ALTERATION_TYPES.map((type) => ({
  label: type.label,
  value: type.id,
}));
const DRESS_OPTIONS = DRESS_TYPES.map((dress) => ({
  label: dress.label,
  value: dress.id,
}));

/**
 * New manual booking (CLAUDE.md §5.1) — the shop creates a booking for a
 * walk-in customer. Presented as a modal; starts the booking as confirmed.
 */
export default function NewManualBooking() {
  const { hours, slotMinutes, blockedDates } = useShopHours();
  const create = useCreateManualBooking();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [alterationTypeId, setAlterationTypeId] = useState<string | null>(null);
  const [dressType, setDressType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [dateId, setDateId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: bookedSlots } = useBookedSlots(dateId);

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
  const taken = bookedSlots ?? [];

  const phoneOk = UK_PHONE_REGEX.test(phone.trim());
  const canSubmit =
    name.trim().length >= 2 &&
    phoneOk &&
    !!alterationTypeId &&
    description.trim().length > 0 &&
    !!dateId &&
    !!time;

  const onSubmit = () => {
    if (!canSubmit || !dateId || !time || !alterationTypeId) return;
    const parsedPrice = price.trim() === '' ? null : Number(price);
    create.mutate(
      {
        guestName: name,
        guestPhone: phone,
        guestEmail: email.trim() || null,
        alterationTypeId,
        dressType,
        description,
        appointmentDate: dateId,
        appointmentTime: time,
        priceQuote:
          parsedPrice !== null && Number.isFinite(parsedPrice)
            ? parsedPrice
            : null,
        internalNotes: notes.trim() || null,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen scroll keyboardAvoiding edges={['top', 'bottom']} className="pb-6">
      <Box className="flex-row items-center justify-between pb-2 pt-2">
        <Text variant="section">New booking</Text>
        <PressableScale
          haptic="selection"
          onPress={() => router.back()}
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
          <X size={20} color={colors.ink} strokeWidth={2} />
        </PressableScale>
      </Box>

      <Box className="mt-4 gap-4">
        <Input
          label="Customer name"
          required
          placeholder="Enter customer name"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Phone"
          required
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          error={
            phone.length > 0 && !phoneOk
              ? "That phone number doesn't look right"
              : undefined
          }
        />
        <Input
          label="Email (optional)"
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Select
          label="Alteration"
          required
          value={alterationTypeId}
          options={TYPE_OPTIONS}
          placeholder="Choose the type of work"
          onChange={setAlterationTypeId}
        />
        <Select
          label="Garment"
          value={dressType}
          options={DRESS_OPTIONS}
          placeholder="Choose a garment type"
          onChange={setDressType}
        />
        <Textarea
          label="What needs doing"
          required
          placeholder="Describe the work — e.g. take in the waist, shorten hem to ankle"
          value={description}
          onChangeText={setDescription}
        />
      </Box>

      <Box className="mt-6">
        <Text variant="caption" className="mb-2 uppercase text-inkMuted">
          Appointment
        </Text>
        <DayStrip
          selectedDateId={dateId}
          blockedDates={blockedDates}
          onSelect={selectDate}
        />
        <PressableScale
          haptic="selection"
          onPress={() => setCalendarOpen(true)}
          accessibilityLabel="See the full calendar"
          className="mt-3 self-start py-1">
          <Text variant="secondary" className="font-body-medium text-rose">
            See full calendar
          </Text>
        </PressableScale>
      </Box>

      {dateId ? (
        <Box className="mt-5 gap-3">
          <Text variant="title">Available times</Text>
          {slots.length === 0 ? (
            <Text variant="body" className="text-inkMuted">
              No times available that day. Try another.
            </Text>
          ) : (
            <Box className="flex-row flex-wrap gap-2">
              {slots.map((slot) => (
                <Chip
                  key={slot}
                  label={formatTimeLabel(slot)}
                  selected={slot === time}
                  disabled={taken.includes(slot)}
                  onPress={() => setTime(slot)}
                />
              ))}
            </Box>
          )}
        </Box>
      ) : null}

      <Box className="mt-6 gap-4">
        <Input
          label="Price quote (£, optional)"
          keyboardType="decimal-pad"
          placeholder="e.g. 35"
          value={price}
          onChangeText={setPrice}
        />
        <Textarea
          label="Internal notes (optional)"
          placeholder="Measurements, fabric, anything to remember…"
          value={notes}
          onChangeText={setNotes}
        />
      </Box>

      {create.isError ? (
        <Box className="mt-5 flex-row items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5">
          <TriangleAlert size={16} color={colors.danger} strokeWidth={2} />
          <Text variant="secondary" className="flex-1 text-danger">
            Couldn’t save the booking. Try again.
          </Text>
        </Box>
      ) : null}

      <Box className="mt-7">
        <Button
          label="Create booking"
          size="lg"
          onPress={onSubmit}
          loading={create.isPending}
          disabled={!canSubmit}
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

import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { MonthCalendar } from '@/components/booking/month-calendar';
import { WizardStep } from '@/components/booking/wizard-step';
import {
  Box,
  Button,
  Input,
  PressableScale,
  Select,
  Sheet,
  Text,
  Textarea,
} from '@/components/ui';
import { DRESS_TYPES } from '@/constants/alteration-types';
import { colors } from '@/constants/brand';
import { formatLong } from '@/lib/date';

import {
  detailsSchema,
  todayId,
  useBookingDraft,
  type DetailsValues,
} from '@/features/bookings';

const DRESS_OPTIONS = DRESS_TYPES.map((type) => ({
  label: type.label,
  value: type.id,
}));

/**
 * Step 3 — garment details. Garment type, a description of the work, and two
 * optional fields. React Hook Form + the shared `detailsSchema`; values flush
 * to the draft store on a valid "Next".
 */
export default function DetailsStep() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === '1';

  const draft = useBookingDraft((s) => s.draft);
  const patch = useBookingDraft((s) => s.patch);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      dressType: draft.dressType ?? '',
      description: draft.description,
      brand: draft.brand,
      neededBy: draft.neededBy,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = (values: DetailsValues) => {
    patch({
      dressType: values.dressType,
      description: values.description.trim(),
      brand: values.brand?.trim() ?? '',
      neededBy: values.neededBy ?? null,
    });
    if (isEditing) router.navigate('/book/review');
    else router.push('/book/schedule');
  };

  return (
    <WizardStep
      step={3}
      footer={
        <Button
          label={isEditing ? 'Save changes' : 'Next'}
          size="lg"
          onPress={handleSubmit(onSubmit)}
        />
      }>
      <Box className="gap-1.5">
        <Text variant="hero">The details</Text>
        <Text variant="body" className="text-inkMuted">
          Tell Steffi about the garment and what you’d like done.
        </Text>
      </Box>

      <Box className="mt-6 gap-4">
        <Controller
          control={control}
          name="dressType"
          render={({ field }) => (
            <Select
              label="Garment type"
              value={field.value || null}
              options={DRESS_OPTIONS}
              onChange={field.onChange}
              placeholder="Choose a garment"
              error={errors.dressType?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              label="What would you like done?"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.description?.message}
              placeholder="e.g. Take in the waist by an inch and shorten the hem to my ankle."
              maxLength={1000}
              showCount
            />
          )}
        />

        <Controller
          control={control}
          name="brand"
          render={({ field }) => (
            <Input
              label="Brand (optional)"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="e.g. Pronovias"
            />
          )}
        />

        <Controller
          control={control}
          name="neededBy"
          render={({ field }) => (
            <Box className="gap-1.5">
              <Text variant="caption" className="uppercase text-inkMuted">
                Needed by (optional)
              </Text>
              <PressableScale
                haptic="selection"
                onPress={() => setCalendarOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Choose a needed-by date"
                className="flex-row items-center justify-between rounded-xl border border-transparent bg-surfaceAlt px-4 py-3">
                <Text
                  variant="body"
                  className={field.value ? 'text-ink' : 'text-inkSubtle'}>
                  {field.value ? formatLong(field.value) : "No date — I’m flexible"}
                </Text>
                <CalendarDays size={18} color={colors.inkMuted} strokeWidth={2} />
              </PressableScale>

              <Sheet
                visible={calendarOpen}
                onClose={() => setCalendarOpen(false)}
                title="Needed by">
                <Box className="gap-4 pb-1">
                  <MonthCalendar
                    selected={field.value ?? null}
                    minDateId={todayId()}
                    onSelect={(id) => {
                      field.onChange(id);
                      setCalendarOpen(false);
                    }}
                  />
                  <Button
                    label="No date — I’m flexible"
                    variant="ghost"
                    onPress={() => {
                      field.onChange(null);
                      setCalendarOpen(false);
                    }}
                  />
                </Box>
              </Sheet>
            </Box>
          )}
        />
      </Box>
    </WizardStep>
  );
}

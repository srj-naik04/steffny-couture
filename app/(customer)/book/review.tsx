import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';

import { PhotoStrip } from '@/components/booking/photo-strip';
import { WizardStep } from '@/components/booking/wizard-step';
import { Box, Button, Card, PressableScale, Text } from '@/components/ui';
import { ALTERATION_TYPES, DRESS_TYPES } from '@/constants/alteration-types';
import { colors } from '@/constants/brand';
import { formatLong, formatTimeLabel } from '@/lib/date';
import { formatPhone } from '@/lib/format';

import {
  incompleteSteps,
  SlotTakenError,
  useBookingDraft,
  useSubmitBooking,
} from '@/features/bookings';

function labelForType(id: string | null): string {
  return ALTERATION_TYPES.find((type) => type.id === id)?.label ?? '—';
}

function labelForDress(id: string | null): string {
  return DRESS_TYPES.find((dress) => dress.id === id)?.label ?? '—';
}

/** One reviewable section with an edit shortcut back to its step. */
function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <Card>
      <Box className="flex-row items-center justify-between">
        <Text variant="title">{title}</Text>
        <PressableScale
          haptic="selection"
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
          className="rounded-full bg-surfaceAlt px-3 py-1.5">
          <Text variant="caption" className="font-body-medium text-rose">
            Edit
          </Text>
        </PressableScale>
      </Box>
      <Box className="mt-3 gap-1">{children}</Box>
    </Card>
  );
}

/**
 * Step 6 — review and confirm. Each section links back to its step with the
 * draft preserved. Confirming inserts the booking, then replaces the route
 * with the confirmed screen (booking-wizard skill §3.2 step 6).
 */
export default function ReviewStep() {
  const draft = useBookingDraft((s) => s.draft);
  const reset = useBookingDraft((s) => s.reset);
  const submit = useSubmitBooking();

  const [error, setError] = useState<string | null>(null);
  const [slotIssue, setSlotIssue] = useState(false);

  const incomplete = incompleteSteps(draft);
  const uploadedPhotos = draft.photos
    .filter((photo) => photo.status === 'uploaded')
    .map((photo) => photo.localUri);

  const onConfirm = () => {
    setError(null);
    setSlotIssue(false);
    submit.mutate(draft, {
      onSuccess: (booking) => {
        reset();
        router.replace({
          pathname: '/book/confirmed',
          params: {
            reference: booking.reference,
            date: booking.appointment_date,
            time: booking.appointment_time,
          },
        });
      },
      onError: (err) => {
        if (err instanceof SlotTakenError) setSlotIssue(true);
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Try again.',
        );
      },
    });
  };

  return (
    <WizardStep
      step={6}
      footer={
        <Box className="gap-2">
          {error ? (
            <Box className="flex-row items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5">
              <CircleAlert size={16} color={colors.danger} strokeWidth={2} />
              <Text variant="secondary" className="flex-1 text-danger">
                {error}
              </Text>
            </Box>
          ) : null}
          {slotIssue ? (
            <Button
              label="Change time"
              variant="secondary"
              onPress={() =>
                router.navigate({
                  pathname: '/book/schedule',
                  params: { edit: '1' },
                })
              }
            />
          ) : null}
          <Button
            label="Confirm booking"
            size="lg"
            onPress={onConfirm}
            loading={submit.isPending}
            disabled={incomplete.length > 0}
          />
          <Text variant="caption" className="text-center text-inkSubtle">
            Steffi will confirm your appointment and send a quote within 24
            hours.
          </Text>
        </Box>
      }>
      <Box className="gap-1.5">
        <Text variant="hero">Review your booking</Text>
        <Text variant="body" className="text-inkMuted">
          A last look before it goes to Steffi.
        </Text>
      </Box>

      <Box className="mt-6 gap-3">
        <SectionCard
          title="Alteration"
          onEdit={() =>
            router.navigate({ pathname: '/book/type', params: { edit: '1' } })
          }>
          <Text variant="body">{labelForType(draft.alterationTypeId)}</Text>
        </SectionCard>

        <SectionCard
          title="Photos"
          onEdit={() =>
            router.navigate({ pathname: '/book/photos', params: { edit: '1' } })
          }>
          {uploadedPhotos.length > 0 ? (
            <PhotoStrip uris={uploadedPhotos} />
          ) : (
            <Text variant="body" className="text-inkSubtle">
              Add at least one photo.
            </Text>
          )}
        </SectionCard>

        <SectionCard
          title="Details"
          onEdit={() =>
            router.navigate({
              pathname: '/book/details',
              params: { edit: '1' },
            })
          }>
          <Text variant="body" className="font-body-medium">
            {labelForDress(draft.dressType)}
          </Text>
          <Text variant="body" className="text-inkMuted">
            {draft.description || 'No description yet.'}
          </Text>
          {draft.brand ? (
            <Text variant="secondary" className="text-inkMuted">
              Brand: {draft.brand}
            </Text>
          ) : null}
          {draft.neededBy ? (
            <Text variant="secondary" className="text-inkMuted">
              Needed by {formatLong(draft.neededBy)}
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Appointment"
          onEdit={() =>
            router.navigate({
              pathname: '/book/schedule',
              params: { edit: '1' },
            })
          }>
          {draft.appointmentDate && draft.appointmentTime ? (
            <>
              <Text variant="body" className="font-body-medium">
                {formatLong(draft.appointmentDate)}
              </Text>
              <Text variant="body" className="text-inkMuted">
                {formatTimeLabel(draft.appointmentTime)}
              </Text>
            </>
          ) : (
            <Text variant="body" className="text-inkSubtle">
              Pick a date and time.
            </Text>
          )}
        </SectionCard>

        <SectionCard
          title="Contact"
          onEdit={() =>
            router.navigate({
              pathname: '/book/contact',
              params: { edit: '1' },
            })
          }>
          <Text variant="body" className="font-body-medium">
            {draft.name || '—'}
          </Text>
          <Text variant="body" className="text-inkMuted">
            {draft.phone ? formatPhone(draft.phone) : '—'}
          </Text>
          <Text variant="body" className="text-inkMuted">
            {draft.email || '—'}
          </Text>
        </SectionCard>
      </Box>
    </WizardStep>
  );
}

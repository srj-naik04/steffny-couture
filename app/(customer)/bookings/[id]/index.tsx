import * as Linking from 'expo-linking';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  CalendarClock,
  ChevronLeft,
  MessageCircle,
  Phone,
  TriangleAlert,
  Undo2,
} from 'lucide-react-native';
import { type ReactNode, useCallback, useState } from 'react';
import { View } from 'react-native';

import { BookingPhotos } from '@/components/booking/booking-photos';
import { StatusTimeline } from '@/components/booking/status-timeline';
import {
  Box,
  Button,
  Card,
  EmptyState,
  PressableScale,
  Screen,
  Sheet,
  Skeleton,
  StatusPill,
  Text,
} from '@/components/ui';
import { ALTERATION_TYPES, DRESS_TYPES } from '@/constants/alteration-types';
import { colors } from '@/constants/brand';
import { formatLong, formatTimeLabel } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import { getPhoneLink, getWhatsAppLink } from '@/lib/whatsapp';

import {
  asBookingStatus,
  isLocked,
  useBooking,
  useBookingHistory,
  useBookingPhotos,
  useCancelBooking,
} from '@/features/bookings';

function BackButton() {
  return (
    <PressableScale
      haptic="selection"
      onPress={() => router.back()}
      accessibilityLabel="Back"
      className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
      <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
    </PressableScale>
  );
}

/** A titled card section on the detail screen. */
function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="mt-4 gap-3">
      <Text variant="caption" className="uppercase text-inkSubtle">
        {title}
      </Text>
      {children}
    </Card>
  );
}

/**
 * Customer booking detail (CLAUDE.md Phase 4) — status, appointment, photos,
 * a live progress timeline, pricing, and ways to reach the studio. Status
 * changes from the shop arrive over Realtime; a focus refetch keeps guests
 * (who have no session for Realtime) current too.
 */
export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = id ?? '';

  const booking = useBooking(bookingId);
  const history = useBookingHistory(bookingId);
  const photos = useBookingPhotos(bookingId, booking.data?.photo_urls);
  const cancel = useCancelBooking();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const refetchBooking = booking.refetch;
  const refetchHistory = history.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetchBooking();
      void refetchHistory();
    }, [refetchBooking, refetchHistory]),
  );

  if (booking.isLoading) {
    return (
      <Screen>
        <Box className="pb-2 pt-2">
          <BackButton />
        </Box>
        <Box className="mt-4 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </Box>
      </Screen>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <Screen>
        <Box className="pb-2 pt-2">
          <BackButton />
        </Box>
        <EmptyState
          icon={<TriangleAlert size={28} color={colors.rose} strokeWidth={1.75} />}
          title={booking.isError ? "Couldn't load this booking" : 'Booking not found'}
          body={
            booking.isError
              ? 'Check your connection and try again.'
              : 'We couldn’t find this booking. It may have been removed.'
          }
          cta={
            booking.isError
              ? { label: 'Try again', onPress: () => void booking.refetch() }
              : { label: 'Back to my bookings', onPress: () => router.back() }
          }
        />
      </Screen>
    );
  }

  const data = booking.data;
  const status = asBookingStatus(data.status);
  const type = ALTERATION_TYPES.find((t) => t.id === data.alteration_type_id);
  const dress = DRESS_TYPES.find((d) => d.id === data.dress_type);
  const locked = isLocked(data.status);

  const message = `Hi Steffi, re: booking ${data.reference}`;
  const onWhatsApp = () => void Linking.openURL(getWhatsAppLink(message));
  const onCall = () => void Linking.openURL(getPhoneLink());

  const onConfirmCancel = () => {
    setCancelError(null);
    cancel.mutate(bookingId, {
      onSuccess: () => setCancelOpen(false),
      onError: (err) =>
        setCancelError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Try again.',
        ),
    });
  };

  const refreshing =
    booking.isRefetching || history.isRefetching || photos.isRefetching;
  const onRefresh = () => {
    void booking.refetch();
    void history.refetch();
    void photos.refetch();
  };

  return (
    <Screen scroll className="pb-8" onRefresh={onRefresh} refreshing={refreshing}>
      <Box className="pb-2 pt-2">
        <BackButton />
      </Box>

      {/* Status hero */}
      <Card className="mt-2 gap-3">
        <Box className="flex-row items-center justify-between">
          <Text variant="caption" className="uppercase text-gold">
            {data.reference}
          </Text>
          <StatusPill status={status} />
        </Box>
        <Text variant="hero">{type?.label ?? 'Alteration'}</Text>
        {type?.description ? (
          <Text variant="secondary" className="text-inkMuted">
            {type.description}
          </Text>
        ) : null}
      </Card>

      <DetailCard title="Appointment">
        <Box className="gap-0.5">
          <Text variant="bodyLg">{formatLong(data.appointment_date)}</Text>
          <Text variant="body" className="text-inkMuted">
            {formatTimeLabel(data.appointment_time)} · Hounslow studio
          </Text>
        </Box>
      </DetailCard>

      {data.photo_urls.length > 0 ? (
        <DetailCard title="Photos">
          {photos.isLoading ? (
            <Box className="flex-row gap-2">
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} className="h-24 w-24 rounded-xl" />
              ))}
            </Box>
          ) : photos.data && photos.data.length > 0 ? (
            <BookingPhotos uris={photos.data} />
          ) : (
            <Text variant="secondary" className="text-inkMuted">
              Photos couldn’t be loaded. Pull down to retry.
            </Text>
          )}
        </DetailCard>
      ) : null}

      <DetailCard title="Details">
        {dress ? (
          <Text variant="body" className="font-body-medium">
            {dress.label}
          </Text>
        ) : null}
        <Text variant="body" className="text-inkMuted">
          {data.description}
        </Text>
      </DetailCard>

      <DetailCard title="Progress">
        {history.data && history.data.length > 0 ? (
          <StatusTimeline history={history.data} currentStatus={data.status} />
        ) : (
          <Text variant="secondary" className="text-inkMuted">
            Status updates will appear here.
          </Text>
        )}
      </DetailCard>

      <DetailCard title="Pricing">
        {data.final_price !== null ? (
          <Box className="flex-row items-center justify-between">
            <Text variant="body" className="text-inkMuted">
              Final price
            </Text>
            <Text variant="bodyLg">{formatCurrency(data.final_price)}</Text>
          </Box>
        ) : data.price_quote !== null ? (
          <Box className="flex-row items-center justify-between">
            <Text variant="body" className="text-inkMuted">
              Quote
            </Text>
            <Text variant="bodyLg">{formatCurrency(data.price_quote)}</Text>
          </Box>
        ) : (
          <Text variant="secondary" className="text-inkMuted">
            Steffi will send a quote within 24 hours of your booking.
          </Text>
        )}
      </DetailCard>

      {/* Actions */}
      <Box className="mt-6 gap-2.5">
        <Button
          label="Message Steffi"
          onPress={onWhatsApp}
          leftIcon={
            <MessageCircle size={18} color={colors.ivory} strokeWidth={2} />
          }
        />
        <Button
          label="Call the studio"
          variant="secondary"
          onPress={onCall}
          leftIcon={<Phone size={18} color={colors.ink} strokeWidth={2} />}
        />
        {!locked ? (
          <>
            <Button
              label="Reschedule"
              variant="secondary"
              onPress={() => router.push(`/bookings/${bookingId}/reschedule`)}
              leftIcon={
                <CalendarClock size={18} color={colors.ink} strokeWidth={2} />
              }
            />
            <Button
              label="Cancel booking"
              variant="destructive"
              onPress={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
              leftIcon={
                <Undo2 size={18} color={colors.danger} strokeWidth={2} />
              }
            />
          </>
        ) : null}
      </Box>

      <Sheet
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this booking?">
        <Text variant="body" className="text-inkMuted">
          Your appointment slot will be released. You can always book again.
        </Text>
        {cancelError ? (
          <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5">
            <TriangleAlert size={16} color={colors.danger} strokeWidth={2} />
            <Text variant="secondary" className="flex-1 text-danger">
              {cancelError}
            </Text>
          </View>
        ) : null}
        <Box className="mt-4 gap-2">
          <Button
            label="Cancel booking"
            variant="destructive"
            loading={cancel.isPending}
            onPress={onConfirmCancel}
          />
          <Button
            label="Keep booking"
            variant="ghost"
            onPress={() => setCancelOpen(false)}
          />
        </Box>
      </Sheet>
    </Screen>
  );
}

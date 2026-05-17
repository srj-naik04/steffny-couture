import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Mail,
  MessageCircle,
  Phone,
  TriangleAlert,
} from 'lucide-react-native';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { BookingPhotos } from '@/components/booking/booking-photos';
import { StatusTimeline } from '@/components/booking/status-timeline';
import { StatusActions } from '@/components/shop/status-actions';
import {
  Box,
  type BookingStatus,
  Button,
  Card,
  EmptyState,
  Input,
  PressableScale,
  Screen,
  Sheet,
  Skeleton,
  StatusPill,
  Text,
  Textarea,
} from '@/components/ui';
import { ALTERATION_TYPES, DRESS_TYPES } from '@/constants/alteration-types';
import { colors } from '@/constants/brand';
import { formatLong, formatTimeLabel } from '@/lib/date';
import { formatPhone, toDialableDigits } from '@/lib/format';

import {
  asBookingStatus,
  type BookingFields,
  useBooking,
  useBookingHistory,
  useBookingPhotos,
  useUpdateBooking,
  useUpdateBookingStatus,
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="mt-4 gap-3">
      <Text variant="caption" className="uppercase text-inkSubtle">
        {title}
      </Text>
      {children}
    </Card>
  );
}

/** A round contact-action button — WhatsApp, call, email the customer. */
function ContactButton({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      haptic="selection"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-surfaceAlt py-2.5">
      {icon}
      <Text variant="caption" className="text-inkMuted">
        {label}
      </Text>
    </PressableScale>
  );
}

/**
 * Shop booking detail (CLAUDE.md §5.3) — everything the customer sees plus the
 * shop-only controls: editable price quote, final price and internal notes,
 * the status-update actions, customer contact, and the full audit trail.
 */
export default function ShopBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = id ?? '';

  const booking = useBooking(bookingId);
  const history = useBookingHistory(bookingId);
  const photos = useBookingPhotos(bookingId, booking.data?.photo_urls);
  const updateStatus = useUpdateBookingStatus();
  const updateBooking = useUpdateBooking();

  const [quote, setQuote] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current && booking.data) {
      seeded.current = true;
      setQuote(booking.data.price_quote?.toString() ?? '');
      setFinalPrice(booking.data.final_price?.toString() ?? '');
      setNotes(booking.data.internal_notes ?? '');
    }
  }, [booking.data]);

  if (booking.isLoading) {
    return (
      <Screen>
        <Box className="pb-2 pt-2">
          <BackButton />
        </Box>
        <Box className="mt-4 gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
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
          title="Couldn't load this booking"
          body="Check your connection and try again."
          cta={{ label: 'Try again', onPress: () => void booking.refetch() }}
        />
      </Screen>
    );
  }

  const data = booking.data;
  const status = asBookingStatus(data.status);
  const type = ALTERATION_TYPES.find((t) => t.id === data.alteration_type_id);
  const dress = DRESS_TYPES.find((d) => d.id === data.dress_type);
  const phone = data.guest_phone ?? '';

  /** Parse a money field, treating blank as "cleared". */
  const parseMoney = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    const value = Number(trimmed);
    return Number.isFinite(value) ? value : null;
  };

  const saveFields = (fields: BookingFields) =>
    updateBooking.mutate({ id: bookingId, fields });

  const onQuoteBlur = () => {
    const next = parseMoney(quote);
    if (next !== (data.price_quote ?? null)) saveFields({ price_quote: next });
  };
  const onFinalBlur = () => {
    const next = parseMoney(finalPrice);
    if (next !== (data.final_price ?? null)) saveFields({ final_price: next });
  };
  const onNotesBlur = () => {
    const next = notes.trim() || null;
    if (next !== (data.internal_notes ?? null))
      saveFields({ internal_notes: next });
  };

  const onStatusChange = (next: BookingStatus) => {
    if (next === 'cancelled') {
      setCancelOpen(true);
      return;
    }
    updateStatus.mutate({ id: bookingId, status: next });
  };

  const onRefresh = () => {
    void booking.refetch();
    void history.refetch();
    void photos.refetch();
  };

  return (
    <Screen
      scroll
      className="pb-8"
      onRefresh={onRefresh}
      refreshing={booking.isRefetching || history.isRefetching}>
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
        <Text variant="body" className="text-inkMuted">
          {dress ? `${dress.label} · ` : ''}
          {formatLong(data.appointment_date)} ·{' '}
          {formatTimeLabel(data.appointment_time)}
        </Text>
      </Card>

      {/* Customer */}
      <Section title="Customer">
        <Box className="gap-0.5">
          <Text variant="bodyLg">{data.guest_name ?? 'Customer'}</Text>
          {phone ? (
            <Text variant="body" className="text-inkMuted">
              {formatPhone(phone)}
            </Text>
          ) : null}
          {data.guest_email ? (
            <Text variant="body" className="text-inkMuted">
              {data.guest_email}
            </Text>
          ) : null}
        </Box>
        <Box className="mt-1 flex-row gap-2">
          {phone ? (
            <>
              <ContactButton
                label="WhatsApp"
                icon={
                  <MessageCircle size={15} color={colors.rose} strokeWidth={2} />
                }
                onPress={() =>
                  void Linking.openURL(
                    `https://wa.me/${toDialableDigits(phone)}`,
                  )
                }
              />
              <ContactButton
                label="Call"
                icon={<Phone size={15} color={colors.rose} strokeWidth={2} />}
                onPress={() => void Linking.openURL(`tel:${phone}`)}
              />
            </>
          ) : null}
          {data.guest_email ? (
            <ContactButton
              label="Email"
              icon={<Mail size={15} color={colors.rose} strokeWidth={2} />}
              onPress={() =>
                void Linking.openURL(`mailto:${data.guest_email}`)
              }
            />
          ) : null}
        </Box>
      </Section>

      {data.photo_urls.length > 0 ? (
        <Section title="Photos">
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
              Photos couldn’t be loaded.
            </Text>
          )}
        </Section>
      ) : null}

      <Section title="What needs doing">
        <Text variant="body" className="text-inkMuted">
          {data.description}
        </Text>
      </Section>

      {/* Pricing — editable, saved on blur */}
      <Section title="Pricing">
        <Input
          label="Price quote (£)"
          keyboardType="decimal-pad"
          placeholder="Not yet quoted"
          value={quote}
          onChangeText={setQuote}
          onBlur={onQuoteBlur}
        />
        <Input
          label="Final price (£)"
          keyboardType="decimal-pad"
          placeholder="Set when the work is done"
          value={finalPrice}
          onChangeText={setFinalPrice}
          onBlur={onFinalBlur}
        />
      </Section>

      <Section title="Internal notes">
        <Textarea
          label="Visible to the shop only"
          placeholder="Measurements, fabric notes, anything to remember…"
          value={notes}
          onChangeText={setNotes}
          onBlur={onNotesBlur}
        />
      </Section>

      {/* Status actions */}
      <Section title="Update status">
        <StatusActions
          status={status}
          pending={updateStatus.isPending}
          onChange={onStatusChange}
        />
      </Section>

      {/* Audit trail */}
      <Section title="History">
        {history.data && history.data.length > 0 ? (
          <StatusTimeline history={history.data} currentStatus={data.status} />
        ) : (
          <Text variant="secondary" className="text-inkMuted">
            No history yet.
          </Text>
        )}
      </Section>

      <Sheet
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this booking?">
        <Text variant="body" className="text-inkMuted">
          The appointment slot will be released and the customer will see it as
          cancelled.
        </Text>
        <Box className="mt-4 gap-2">
          <Button
            label="Cancel booking"
            variant="destructive"
            loading={updateStatus.isPending}
            onPress={() =>
              updateStatus.mutate(
                { id: bookingId, status: 'cancelled' },
                { onSuccess: () => setCancelOpen(false) },
              )
            }
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

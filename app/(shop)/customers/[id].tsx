import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Mail,
  MessageCircle,
  Phone,
  TriangleAlert,
} from 'lucide-react-native';
import { type ReactNode, useMemo } from 'react';

import { ShopBookingCard } from '@/components/shop/shop-booking-card';
import {
  Box,
  Card,
  EmptyState,
  PressableScale,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { colors } from '@/constants/brand';
import { formatCurrency, formatPhone, toDialableDigits } from '@/lib/format';

import { useShopBookings } from '@/features/bookings';
import { findCustomer } from '@/features/customers';

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

/** Shop customer detail (CLAUDE.md §5.4) — contact, spend and full history. */
export default function ShopCustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch, isRefetching } = useShopBookings();

  const customer = useMemo(
    () => (data ? findCustomer(data, id ?? '') : undefined),
    [data, id],
  );

  if (isLoading) {
    return (
      <Screen>
        <Box className="pb-2 pt-2">
          <BackButton />
        </Box>
        <Box className="mt-4 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </Box>
      </Screen>
    );
  }

  if (isError || !customer) {
    return (
      <Screen>
        <Box className="pb-2 pt-2">
          <BackButton />
        </Box>
        <EmptyState
          icon={<TriangleAlert size={28} color={colors.rose} strokeWidth={1.75} />}
          title={isError ? "Couldn't load this customer" : 'Customer not found'}
          body={
            isError
              ? 'Check your connection and try again.'
              : 'This customer may no longer have any bookings.'
          }
          cta={
            isError
              ? { label: 'Try again', onPress: () => void refetch() }
              : { label: 'Back to customers', onPress: () => router.back() }
          }
        />
      </Screen>
    );
  }

  const phone = customer.phone ?? '';

  return (
    <Screen
      scroll
      className="pb-8"
      onRefresh={() => void refetch()}
      refreshing={isRefetching}>
      <Box className="pb-2 pt-2">
        <BackButton />
      </Box>

      <Card className="mt-2 gap-3">
        <Text variant="hero">{customer.name}</Text>
        {phone ? (
          <Text variant="body" className="text-inkMuted">
            {formatPhone(phone)}
          </Text>
        ) : null}
        {customer.email ? (
          <Text variant="body" className="text-inkMuted">
            {customer.email}
          </Text>
        ) : null}

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
          {customer.email ? (
            <ContactButton
              label="Email"
              icon={<Mail size={15} color={colors.rose} strokeWidth={2} />}
              onPress={() =>
                void Linking.openURL(`mailto:${customer.email}`)
              }
            />
          ) : null}
        </Box>
      </Card>

      <Box className="mt-4 flex-row gap-2.5">
        <Card className="flex-1 gap-1">
          <Text variant="hero" className="text-rose">
            {customer.bookingCount}
          </Text>
          <Text variant="caption" className="text-inkMuted">
            {customer.bookingCount === 1 ? 'Booking' : 'Bookings'}
          </Text>
        </Card>
        <Card className="flex-1 gap-1">
          <Text variant="hero" className="text-rose">
            {customer.totalSpend > 0
              ? formatCurrency(customer.totalSpend)
              : '—'}
          </Text>
          <Text variant="caption" className="text-inkMuted">
            Total spend
          </Text>
        </Card>
      </Box>

      <Box className="mt-7 gap-3">
        <Text variant="section">Booking history</Text>
        {customer.bookings.map((booking) => (
          <ShopBookingCard
            key={booking.id}
            booking={booking}
            showDate
            onPress={() => router.push(`/bookings/${booking.id}`)}
          />
        ))}
      </Box>
    </Screen>
  );
}

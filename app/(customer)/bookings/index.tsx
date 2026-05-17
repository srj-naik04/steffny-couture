import { router } from 'expo-router';
import { CalendarHeart, ChevronLeft, TriangleAlert } from 'lucide-react-native';

import { BookingCard } from '@/components/booking/booking-card';
import { FadeInView } from '@/components/motion';
import { Box, EmptyState, PressableScale, Screen, Skeleton, Text } from '@/components/ui';
import { colors } from '@/constants/brand';

import {
  type BookingRow,
  isActiveStatus,
  useBookingDraft,
  useMyBookings,
} from '@/features/bookings';

/** Soonest appointment first for active work; most recent first for past. */
function sortBookings(rows: BookingRow[], active: boolean): BookingRow[] {
  return [...rows].sort((a, b) =>
    active
      ? a.appointment_date.localeCompare(b.appointment_date)
      : b.appointment_date.localeCompare(a.appointment_date),
  );
}

function ScreenHeader() {
  return (
    <Box className="flex-row items-center gap-3 pb-2 pt-2">
      <PressableScale
        haptic="selection"
        onPress={() => router.back()}
        accessibilityLabel="Back"
        className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
        <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
      </PressableScale>
      <Text variant="section">My bookings</Text>
    </Box>
  );
}

function Section({
  title,
  bookings,
  startDelay,
}: {
  title: string;
  bookings: BookingRow[];
  startDelay: number;
}) {
  if (bookings.length === 0) return null;
  return (
    <Box className="mt-6 gap-3">
      <Text variant="caption" className="uppercase text-inkSubtle">
        {title}
      </Text>
      {bookings.map((booking, index) => (
        <FadeInView key={booking.id} delay={startDelay + index * 40}>
          <BookingCard
            booking={booking}
            onPress={() => router.push(`/bookings/${booking.id}`)}
          />
        </FadeInView>
      ))}
    </Box>
  );
}

/**
 * Customer "My bookings" — every booking made on this device (and, when
 * signed in, account bookings too), split into active work and past jobs,
 * with live status (CLAUDE.md Phase 4).
 */
export default function MyBookings() {
  const reset = useBookingDraft((s) => s.reset);
  const { data, isLoading, isError, refetch, isRefetching } = useMyBookings();

  const startBooking = () => {
    reset();
    router.push('/book/type');
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader />
        <Box className="mt-6 gap-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-28 w-full rounded-2xl" />
          ))}
        </Box>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ScreenHeader />
        <EmptyState
          icon={
            <TriangleAlert size={28} color={colors.rose} strokeWidth={1.75} />
          }
          title="Couldn't load your bookings"
          body="Check your connection and try again — your bookings are safe."
          cta={{ label: 'Try again', onPress: () => void refetch() }}
        />
      </Screen>
    );
  }

  const bookings = data ?? [];

  if (bookings.length === 0) {
    return (
      <Screen onRefresh={() => void refetch()} refreshing={isRefetching}>
        <ScreenHeader />
        <EmptyState
          icon={
            <CalendarHeart size={28} color={colors.rose} strokeWidth={1.75} />
          }
          title="No bookings yet"
          body="Your alteration appointments will appear here once you book — with live status as Steffi works through them."
          cta={{ label: 'Book an alteration', onPress: startBooking }}
        />
      </Screen>
    );
  }

  const active = sortBookings(
    bookings.filter((b) => isActiveStatus(b.status)),
    true,
  );
  const past = sortBookings(
    bookings.filter((b) => !isActiveStatus(b.status)),
    false,
  );

  return (
    <Screen
      scroll
      className="pb-8"
      onRefresh={() => void refetch()}
      refreshing={isRefetching}>
      <ScreenHeader />
      <Section title="Active" bookings={active} startDelay={0} />
      <Section
        title="Past"
        bookings={past}
        startDelay={active.length * 40}
      />
    </Screen>
  );
}

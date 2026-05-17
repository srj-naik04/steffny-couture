import { startOfWeek } from 'date-fns';
import { router } from 'expo-router';
import { CircleAlert, Plus, TriangleAlert } from 'lucide-react-native';

import { NotificationCenter } from '@/components/notifications/notification-center';
import { KpiTile } from '@/components/shop/kpi-tile';
import { ShopBookingCard } from '@/components/shop/shop-booking-card';
import { Box, Card, EmptyState, Fab, Screen, Skeleton, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { formatLong, nowInLondon } from '@/lib/date';

import { useAuth } from '@/features/auth';
import {
  asBookingStatus,
  type BookingRow,
  todayId,
  useShopBookings,
} from '@/features/bookings';

function greeting(): string {
  const hour = nowInLondon().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** First name only, for a warm but brief greeting. */
function firstName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? '';
}

/**
 * Shop "Today" dashboard (CLAUDE.md §5.1) — the day at a glance: the KPIs
 * that matter, today's appointments, and the bookings still needing a quote.
 */
export default function ShopToday() {
  const { profile } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = useShopBookings();

  if (isLoading) {
    return (
      <Screen>
        <Box className="gap-4 pt-2">
          <Skeleton className="h-10 w-2/3 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </Box>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <EmptyState
          icon={<TriangleAlert size={28} color={colors.rose} strokeWidth={1.75} />}
          title="Couldn't load the dashboard"
          body="Check your connection and try again."
          cta={{ label: 'Try again', onPress: () => void refetch() }}
        />
      </Screen>
    );
  }

  const today = todayId();
  const weekStart = startOfWeek(nowInLondon(), { weekStartsOn: 1 });

  const todays = data
    .filter(
      (b) =>
        b.appointment_date === today &&
        asBookingStatus(b.status) !== 'cancelled',
    )
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  const awaitingCollection = data.filter(
    (b) => asBookingStatus(b.status) === 'ready',
  );
  const newThisWeek = data.filter((b) => new Date(b.created_at) >= weekStart);
  const needsAttention = data.filter(
    (b) => asBookingStatus(b.status) === 'new' && b.price_quote === null,
  );

  const open = (booking: BookingRow) => router.push(`/bookings/${booking.id}`);

  return (
    <Screen
      scroll
      className="pb-8"
      onRefresh={() => void refetch()}
      refreshing={isRefetching}>
      <Box className="flex-row items-start justify-between pb-2 pt-2">
        <Box className="flex-1 pr-3">
          <Text variant="caption" className="uppercase text-gold">
            {greeting()}
            {firstName(profile?.full_name)
              ? `, ${firstName(profile?.full_name)}`
              : ''}
          </Text>
          <Text variant="hero" className="mt-1">
            {formatLong(nowInLondon())}
          </Text>
        </Box>
        <NotificationCenter />
      </Box>

      <Box className="mt-5 flex-row gap-2.5">
        <KpiTile label="Today" value={todays.length} />
        <KpiTile label="To collect" value={awaitingCollection.length} />
        <KpiTile label="New this week" value={newThisWeek.length} />
      </Box>

      <Box className="mt-7 gap-3">
        <Text variant="section">Today’s appointments</Text>
        {todays.length === 0 ? (
          <Card>
            <Text variant="body" className="text-inkMuted">
              Nothing booked for today. Enjoy the calm.
            </Text>
          </Card>
        ) : (
          todays.map((booking) => (
            <ShopBookingCard
              key={booking.id}
              booking={booking}
              onPress={() => open(booking)}
            />
          ))
        )}
      </Box>

      {needsAttention.length > 0 ? (
        <Box className="mt-7 gap-3">
          <Box className="flex-row items-center gap-2">
            <CircleAlert size={18} color={colors.warning} strokeWidth={2} />
            <Text variant="section">Needs a quote</Text>
          </Box>
          <Text variant="secondary" className="text-inkMuted">
            New bookings waiting for you to price.
          </Text>
          {needsAttention.map((booking) => (
            <ShopBookingCard
              key={booking.id}
              booking={booking}
              showDate
              onPress={() => open(booking)}
            />
          ))}
        </Box>
      ) : null}

      <Fab
        icon={<Plus size={22} color={colors.ivory} strokeWidth={2.5} />}
        label="New booking"
        accessibilityLabel="New manual booking"
        onPress={() => router.push('/bookings/new')}
      />
    </Screen>
  );
}

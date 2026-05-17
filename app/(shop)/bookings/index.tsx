import { router } from 'expo-router';
import { Plus, TriangleAlert } from 'lucide-react-native';
import { useMemo, useState } from 'react';

import { BookingCalendar } from '@/components/shop/booking-calendar';
import { KanbanBoard } from '@/components/shop/kanban-board';
import { ShopBookingCard } from '@/components/shop/shop-booking-card';
import {
  Box,
  type BookingStatus,
  Chip,
  EmptyState,
  Input,
  PressableScale,
  Screen,
  Segmented,
  Sheet,
  Skeleton,
  Text,
} from '@/components/ui';
import { colors } from '@/constants/brand';
import { formatLong } from '@/lib/date';

import {
  asBookingStatus,
  type BookingRow,
  STATUS_LABEL,
  useShopBookings,
  useUpdateBookingStatus,
} from '@/features/bookings';

type View = 'list' | 'kanban' | 'calendar';
type Filter = BookingStatus | 'all';

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'calendar', label: 'Calendar' },
];

const FILTERS: Filter[] = [
  'all',
  'new',
  'confirmed',
  'in_progress',
  'ready',
  'collected',
  'cancelled',
];

function matchesSearch(booking: BookingRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    booking.reference,
    booking.guest_name ?? '',
    booking.guest_phone ?? '',
    booking.description,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function ScreenHeader() {
  return (
    <Box className="flex-row items-center justify-between pb-2 pt-2">
      <Text variant="section">Bookings</Text>
      <PressableScale
        haptic="medium"
        onPress={() => router.push('/bookings/new')}
        accessibilityLabel="New manual booking"
        className="h-9 w-9 items-center justify-center rounded-full bg-rose">
        <Plus size={20} color={colors.ivory} strokeWidth={2.5} />
      </PressableScale>
    </Box>
  );
}

/**
 * Shop bookings — every booking across three views: a filterable list, a
 * drag-and-drop kanban, and a month calendar (CLAUDE.md §5.2).
 */
export default function ShopBookings() {
  const { data, isLoading, isError, refetch, isRefetching } = useShopBookings();
  const updateStatus = useUpdateBookingStatus();

  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [daySheet, setDaySheet] = useState<string | null>(null);

  const bookings = useMemo(() => data ?? [], [data]);

  const listed = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (filter === 'all' || asBookingStatus(b.status) === filter) &&
          matchesSearch(b, search),
      ),
    [bookings, filter, search],
  );

  const countsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      if (asBookingStatus(b.status) === 'cancelled') continue;
      counts[b.appointment_date] = (counts[b.appointment_date] ?? 0) + 1;
    }
    return counts;
  }, [bookings]);

  const dayBookings = daySheet
    ? bookings
        .filter((b) => b.appointment_date === daySheet)
        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
    : [];

  const open = (id: string) => router.push(`/bookings/${id}`);
  const openFromSheet = (id: string) => {
    setDaySheet(null);
    open(id);
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader />
        <Box className="mt-4 gap-3">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-20 w-full rounded-2xl" />
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
          icon={<TriangleAlert size={28} color={colors.rose} strokeWidth={1.75} />}
          title="Couldn't load bookings"
          body="Check your connection and try again."
          cta={{ label: 'Try again', onPress: () => void refetch() }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll={view !== 'kanban'}
      className="pb-6"
      onRefresh={view !== 'kanban' ? () => void refetch() : undefined}
      refreshing={isRefetching}>
      <ScreenHeader />

      <Box className="mt-1">
        <Segmented options={VIEW_OPTIONS} value={view} onChange={setView} />
      </Box>

      {view === 'list' ? (
        <Box className="mt-4 gap-3">
          <Input
            label="Search"
            placeholder="Reference, name, phone…"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          <Box className="flex-row flex-wrap gap-2">
            {FILTERS.map((value) => (
              <Chip
                key={value}
                label={value === 'all' ? 'All' : STATUS_LABEL[value]}
                selected={filter === value}
                onPress={() => setFilter(value)}
              />
            ))}
          </Box>

          {listed.length === 0 ? (
            <Box className="py-16">
              <Text variant="body" className="text-center text-inkMuted">
                No bookings match.
              </Text>
            </Box>
          ) : (
            listed.map((booking) => (
              <ShopBookingCard
                key={booking.id}
                booking={booking}
                showDate
                onPress={() => open(booking.id)}
              />
            ))
          )}
        </Box>
      ) : null}

      {view === 'kanban' ? (
        <Box className="-mx-5 mt-4 flex-1">
          <KanbanBoard
            bookings={bookings}
            onMove={(id, status) => updateStatus.mutate({ id, status })}
            onOpen={open}
          />
        </Box>
      ) : null}

      {view === 'calendar' ? (
        <Box className="mt-4">
          <BookingCalendar
            countsByDate={countsByDate}
            onSelectDay={setDaySheet}
          />
        </Box>
      ) : null}

      <Sheet
        visible={daySheet !== null}
        onClose={() => setDaySheet(null)}
        title={daySheet ? formatLong(daySheet) : ''}>
        {dayBookings.length === 0 ? (
          <Text variant="body" className="pb-2 text-inkMuted">
            No bookings on this day.
          </Text>
        ) : (
          <Box className="gap-2 pb-2">
            {dayBookings.map((booking) => (
              <ShopBookingCard
                key={booking.id}
                booking={booking}
                onPress={() => openFromSheet(booking.id)}
              />
            ))}
          </Box>
        )}
      </Sheet>
    </Screen>
  );
}

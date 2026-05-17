import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { KanbanCard } from '@/components/shop/kanban-card';
import {
  BOARD_PAD,
  COLUMN_GAP,
  COLUMN_WIDTH,
  KANBAN_STATUSES,
} from '@/components/shop/kanban-constants';
import { type BookingStatus, Text } from '@/components/ui';

import {
  asBookingStatus,
  type BookingRow,
  STATUS_LABEL,
} from '@/features/bookings';

type Props = {
  bookings: BookingRow[];
  onMove: (id: string, status: BookingStatus) => void;
  onOpen: (id: string) => void;
};

type ColumnProps = {
  status: BookingStatus;
  columnIndex: number;
  bookings: BookingRow[];
  scrollX: SharedValue<number>;
  activeColumn: SharedValue<number>;
  onMove: (id: string, status: BookingStatus) => void;
  onOpen: (id: string) => void;
  onDragChange: (dragging: boolean) => void;
};

/** One status column. Its z-index lifts while a card inside it is dragged. */
function KanbanColumn({
  status,
  columnIndex,
  bookings,
  scrollX,
  activeColumn,
  onMove,
  onOpen,
  onDragChange,
}: ColumnProps) {
  const layerStyle = useAnimatedStyle(() => ({
    zIndex: activeColumn.value === columnIndex ? 20 : 1,
  }));

  return (
    <Animated.View style={[layerStyle, { width: COLUMN_WIDTH }]}>
      <View className="mb-2 flex-row items-center justify-between px-1">
        <Text variant="caption" className="uppercase text-inkMuted">
          {STATUS_LABEL[status]}
        </Text>
        <View className="min-w-6 items-center rounded-full bg-surfaceAlt px-2 py-0.5">
          <Text variant="caption" className="text-inkMuted">
            {bookings.length}
          </Text>
        </View>
      </View>
      <View className="gap-2">
        {bookings.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-borderStrong py-8">
            <Text variant="caption" className="text-center text-inkSubtle">
              Nothing here
            </Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <KanbanCard
              key={booking.id}
              booking={booking}
              columnIndex={columnIndex}
              scrollX={scrollX}
              activeColumn={activeColumn}
              onMove={onMove}
              onOpen={() => onOpen(booking.id)}
              onDragChange={onDragChange}
            />
          ))
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Kanban board — five status columns; drag a card between them to change its
 * status (CLAUDE.md §5.2). The board stops scrolling while a card is held so
 * the drag gesture is never stolen.
 */
export function KanbanBoard({ bookings, onMove, onOpen }: Props) {
  const scrollX = useSharedValue(0);
  const activeColumn = useSharedValue(-1);
  const [dragging, setDragging] = useState(false);

  const byStatus = useMemo(() => {
    const grouped: Record<string, BookingRow[]> = {};
    for (const status of KANBAN_STATUSES) grouped[status] = [];
    for (const booking of bookings) {
      grouped[asBookingStatus(booking.status)]?.push(booking);
    }
    return grouped;
  }, [bookings]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <Animated.ScrollView
      horizontal
      className="flex-1"
      showsHorizontalScrollIndicator={false}
      scrollEnabled={!dragging}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: BOARD_PAD,
        paddingBottom: 24,
        gap: COLUMN_GAP,
      }}>
      {KANBAN_STATUSES.map((status, columnIndex) => (
        <KanbanColumn
          key={status}
          status={status}
          columnIndex={columnIndex}
          bookings={byStatus[status] ?? []}
          scrollX={scrollX}
          activeColumn={activeColumn}
          onMove={onMove}
          onOpen={onOpen}
          onDragChange={setDragging}
        />
      ))}
    </Animated.ScrollView>
  );
}

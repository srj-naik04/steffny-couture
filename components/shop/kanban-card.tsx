import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  BOARD_PAD,
  COLUMN_GAP,
  COLUMN_WIDTH,
  KANBAN_STATUSES,
} from '@/components/shop/kanban-constants';
import { type BookingStatus, Text } from '@/components/ui';
import { ALTERATION_TYPES } from '@/constants/alteration-types';
import { delightSpring } from '@/constants/brand';
import { formatShort, formatTimeLabel } from '@/lib/date';
import { haptics } from '@/lib/haptics';

import { type BookingRow } from '@/features/bookings';

type Props = {
  booking: BookingRow;
  columnIndex: number;
  scrollX: SharedValue<number>;
  activeColumn: SharedValue<number>;
  onMove: (id: string, status: BookingStatus) => void;
  onOpen: () => void;
  onDragChange: (dragging: boolean) => void;
};

/**
 * A draggable kanban card. Long-press to lift it, drag across columns, and on
 * release its status is set from the column under the finger. The board
 * refetches afterwards — so a failed update naturally lands the card back
 * where it started (CLAUDE.md §5.2 — "drag updates DB and reverts on failure").
 */
export function KanbanCard({
  booking,
  columnIndex,
  scrollX,
  activeColumn,
  onMove,
  onOpen,
  onDragChange,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lifted = useSharedValue(0);

  const drag = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart(() => {
      lifted.value = withSpring(1, delightSpring);
      activeColumn.value = columnIndex;
      runOnJS(onDragChange)(true);
      runOnJS(haptics.light)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const slot = COLUMN_WIDTH + COLUMN_GAP;
      const contentX = event.absoluteX + scrollX.value - BOARD_PAD;
      const raw = Math.floor(contentX / slot);
      const target = Math.min(Math.max(raw, 0), KANBAN_STATUSES.length - 1);
      const nextStatus = KANBAN_STATUSES[target] ?? 'new';

      if (target !== columnIndex) {
        runOnJS(haptics.medium)();
        runOnJS(onMove)(booking.id, nextStatus);
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      lifted.value = withSpring(0);
    })
    .onFinalize(() => {
      activeColumn.value = -1;
      runOnJS(onDragChange)(false);
    });

  const tap = Gesture.Tap()
    .maxDuration(220)
    .onEnd(() => {
      runOnJS(onOpen)();
    });

  const gesture = Gesture.Exclusive(drag, tap);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: 1 + lifted.value * 0.04 },
    ],
    zIndex: lifted.value > 0 ? 100 : 0,
    elevation: lifted.value > 0 ? 8 : 0,
    shadowColor: '#1F1B1A',
    shadowOpacity: lifted.value * 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  }));

  const type = ALTERATION_TYPES.find(
    (entry) => entry.id === booking.alteration_type_id,
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={style}
        className="rounded-2xl border border-border bg-surface p-3">
        <Text variant="body" className="font-body-semibold" numberOfLines={1}>
          {booking.guest_name ?? 'Customer'}
        </Text>
        <Text
          variant="caption"
          className="mt-0.5 text-inkMuted"
          numberOfLines={1}>
          {type?.label ?? 'Alteration'}
        </Text>
        <Text variant="caption" className="mt-1.5 text-inkSubtle">
          {formatShort(booking.appointment_date)} ·{' '}
          {formatTimeLabel(booking.appointment_time)}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

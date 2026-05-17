import { View } from 'react-native';

import { FadeInView } from '@/components/motion';
import { Text } from '@/components/ui';
import { formatShort, formatTime } from '@/lib/date';

import {
  asBookingStatus,
  type BookingStatusHistoryRow,
  LIFECYCLE,
  STATUS_LABEL,
} from '@/features/bookings';

type Props = {
  history: BookingStatusHistoryRow[];
  /** The booking's current status — drives which steps still lie ahead. */
  currentStatus: string;
};

type Entry = {
  key: string;
  label: string;
  /** A real, recorded transition (vs an upcoming step). */
  done: boolean;
  timestamp?: string;
  note?: string;
};

/** One dot + content row. The rail line connects this dot to the next. */
function TimelineRow({ entry, isLast }: { entry: Entry; isLast: boolean }) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View
          className={`mt-1 h-3.5 w-3.5 rounded-full border-2 ${
            entry.done
              ? 'border-rose bg-rose'
              : 'border-borderStrong bg-surface'
          }`}
        />
        {!isLast ? (
          <View className="my-0.5 w-0.5 flex-1 bg-border" />
        ) : null}
      </View>
      <View className={`flex-1 pb-5 ${entry.done ? '' : 'opacity-45'}`}>
        <Text variant="body" className="font-body-medium">
          {entry.label}
        </Text>
        {entry.timestamp ? (
          <Text variant="caption" className="mt-0.5 text-inkSubtle">
            {entry.timestamp}
          </Text>
        ) : null}
        {entry.note ? (
          <Text variant="secondary" className="mt-1 text-inkMuted">
            {entry.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Vertical progress of a booking — every recorded status change as a filled
 * dot, with the steps still to come shown faded. Reflects the audit trail
 * exactly (CLAUDE.md Phase 4 — "status timeline accurate").
 */
export function StatusTimeline({ history, currentStatus }: Props) {
  const done: Entry[] = history.map((row) => ({
    key: row.id,
    label: STATUS_LABEL[asBookingStatus(row.to_status)],
    done: true,
    timestamp: `${formatShort(row.changed_at)} · ${formatTime(row.changed_at)}`,
    note: row.note ?? undefined,
  }));

  // Steps still ahead — skipped entirely once a booking is cancelled.
  const current = asBookingStatus(currentStatus);
  const fromIndex = LIFECYCLE.indexOf(current);
  const upcoming: Entry[] =
    current === 'cancelled' || fromIndex < 0
      ? []
      : LIFECYCLE.slice(fromIndex + 1).map((status) => ({
          key: `upcoming-${status}`,
          label: STATUS_LABEL[status],
          done: false,
        }));

  const entries = [...done, ...upcoming];

  return (
    <View>
      {entries.map((entry, index) => (
        <FadeInView key={entry.key} delay={index * 40}>
          <TimelineRow entry={entry} isLast={index === entries.length - 1} />
        </FadeInView>
      ))}
    </View>
  );
}

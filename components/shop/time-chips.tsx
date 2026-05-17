import { ScrollView } from 'react-native';

import { Chip } from '@/components/ui';
import { formatTimeLabel } from '@/lib/date';

/** Half-hourly times offered by the opening-hours editor, 07:00–21:30. */
export const TIME_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const minutes = 7 * 60 + i * 30;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

type Props = {
  value: string;
  onChange: (time: string) => void;
};

/** A horizontal-scrolling row of selectable time chips. */
export function TimeChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pr-1">
      {TIME_OPTIONS.map((time) => (
        <Chip
          key={time}
          label={formatTimeLabel(time)}
          selected={time === value}
          onPress={() => onChange(time)}
        />
      ))}
    </ScrollView>
  );
}

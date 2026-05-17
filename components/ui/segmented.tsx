import { View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Segmented control — a row of mutually exclusive options on a tonal track.
 * Used for the shop bookings view switcher (List / Kanban / Calendar).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View className="flex-row rounded-xl bg-surfaceAlt p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            haptic="light"
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            className={`flex-1 items-center rounded-lg py-2 ${selected ? 'bg-surface' : ''}`}>
            <Text
              variant="secondary"
              className={`font-body-medium ${selected ? 'text-rose' : 'text-inkMuted'}`}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

import { View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

/**
 * Switch-style toggle. The track turns rose when on and the thumb sits at the
 * matching end. Fires a `light` haptic, in line with §3.6.
 */
export function Toggle({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <PressableScale
      haptic="light"
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      className={`h-7 w-12 justify-center rounded-full px-0.5 ${
        value ? 'items-end bg-rose' : 'items-start bg-borderStrong'
      }`}>
      <View className="h-6 w-6 rounded-full bg-surface" />
    </PressableScale>
  );
}

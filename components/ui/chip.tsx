import { type ReactNode } from 'react';
import { View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';

type Props = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Optional leading element, e.g. a Lucide icon. */
  icon?: ReactNode;
  className?: string;
  accessibilityLabel?: string;
};

/**
 * Selectable chip — time slots, the schedule day picker, edit prompts. Rose
 * when selected, a bordered surface otherwise.
 */
export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  icon,
  className,
  accessibilityLabel,
}: Props) {
  const container = selected
    ? 'bg-rose border-rose'
    : 'bg-surface border-borderStrong';

  return (
    <PressableScale
      haptic={disabled ? 'none' : 'selection'}
      onPress={disabled || !onPress ? () => {} : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      className={`flex-row items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 ${container} ${disabled ? 'opacity-40' : ''} ${className ?? ''}`}>
      {icon ? <View>{icon}</View> : null}
      <Text
        variant="secondary"
        className={`font-body-medium ${selected ? 'text-ivory' : 'text-ink'}`}>
        {label}
      </Text>
    </PressableScale>
  );
}

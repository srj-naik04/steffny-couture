import { type ReactNode } from 'react';
import { View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';

type Props = {
  children: ReactNode;
  className?: string;
  /** When provided, the card becomes a tappable surface with press feedback. */
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Surface card — white background, 1px border, 16px radius (CLAUDE.md §3.4).
 * Pass `onPress` for the pressable variant.
 */
export function Card({ children, className, onPress, accessibilityLabel }: Props) {
  const base = `rounded-2xl border border-border bg-surface p-4 ${className ?? ''}`;

  if (onPress) {
    return (
      <PressableScale
        haptic="selection"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={base}>
        {children}
      </PressableScale>
    );
  }

  return <View className={base}>{children}</View>;
}

import { type ReactNode } from 'react';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';

type Props = {
  icon: ReactNode;
  /** Optional text — omit for a circular icon-only FAB. */
  label?: string;
  onPress: () => void;
  accessibilityLabel: string;
};

/**
 * Floating action button — pinned bottom-right above the tab bar. The shop's
 * "new manual booking" entry point (CLAUDE.md §5.1).
 */
export function Fab({ icon, label, onPress, accessibilityLabel }: Props) {
  return (
    <PressableScale
      haptic="medium"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`absolute bottom-5 right-5 flex-row items-center gap-2 rounded-full bg-rose shadow-lg ${
        label ? 'px-5 py-4' : 'h-14 w-14 justify-center'
      }`}>
      {icon}
      {label ? (
        <Text variant="body" className="font-body-medium text-ivory">
          {label}
        </Text>
      ) : null}
    </PressableScale>
  );
}

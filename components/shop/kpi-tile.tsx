import { type ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

type Props = {
  label: string;
  value: string | number;
  icon?: ReactNode;
};

/** A single dashboard metric — big number over a label (CLAUDE.md §5.1). */
export function KpiTile({ label, value, icon }: Props) {
  return (
    <View className="flex-1 gap-1 rounded-2xl border border-border bg-surface p-3">
      {icon ? <View className="mb-0.5">{icon}</View> : null}
      <Text variant="hero" className="text-rose">
        {value}
      </Text>
      <Text variant="caption" className="text-inkMuted">
        {label}
      </Text>
    </View>
  );
}

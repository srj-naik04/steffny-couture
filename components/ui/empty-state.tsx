import { type ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Props = {
  /** A Lucide icon element, e.g. `<Calendar size={28} color={colors.rose} />`. */
  icon: ReactNode;
  title: string;
  body: string;
  cta?: { label: string; onPress: () => void };
};

/**
 * Empty state — never a blank screen. Always an icon, a short title, a
 * helpful line, and (usually) a way forward (brand skill copy patterns).
 */
export function EmptyState({ icon, title, body, cta }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-roseSoft">
        {icon}
      </View>
      <Text variant="section" className="text-center">
        {title}
      </Text>
      <Text variant="body" className="text-center text-inkMuted">
        {body}
      </Text>
      {cta ? (
        <View className="mt-2">
          <Button label={cta.label} onPress={cta.onPress} />
        </View>
      ) : null}
    </View>
  );
}

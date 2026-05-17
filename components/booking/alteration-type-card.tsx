import {
  CircleHelp,
  Heart,
  MoveHorizontal,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { colors } from '@/constants/brand';

/** Lucide icons referenced by `alteration_types.icon`. */
const ICONS: Record<string, typeof CircleHelp> = {
  Ruler,
  Scissors,
  MoveHorizontal,
  Shirt,
  Heart,
  Zap,
  Sparkles,
  CircleHelp,
};

type Props = {
  label: string;
  priceLabel: string;
  iconName: string | null;
  selected: boolean;
  onPress: () => void;
};

/** A tappable alteration-type tile for the wizard's first step. */
export function AlterationTypeCard({
  label,
  priceLabel,
  iconName,
  selected,
  onPress,
}: Props) {
  const Icon = (iconName && ICONS[iconName]) || CircleHelp;

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${label}, ${priceLabel}`}
      className={`flex-1 gap-3 ${selected ? 'border-rose bg-roseSoft' : ''}`}>
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          selected ? 'bg-rose' : 'bg-surfaceAlt'
        }`}>
        <Icon
          size={22}
          color={selected ? colors.ivory : colors.rose}
          strokeWidth={1.75}
        />
      </View>
      <View className="gap-0.5">
        <Text variant="bodyLg">{label}</Text>
        <Text variant="caption" className="text-inkMuted">
          {priceLabel}
        </Text>
      </View>
    </Card>
  );
}

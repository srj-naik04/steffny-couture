import { Check, Info, TriangleAlert } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { colors } from '@/constants/brand';
import { useReducedMotion } from '@/lib/motion';
import { type Toast, type ToastKind, useToastStore } from '@/lib/toast';

/** How long a toast stays before it dismisses itself. */
const VISIBLE_MS = 3600;

const STYLES: Record<
  ToastKind,
  { container: string; iconColor: string; Icon: typeof Check }
> = {
  success: { container: 'bg-success', iconColor: colors.ivory, Icon: Check },
  error: { container: 'bg-danger', iconColor: colors.ivory, Icon: TriangleAlert },
  info: { container: 'bg-ink', iconColor: colors.ivory, Icon: Info },
};

/** A single toast — slides down on enter, eases away on dismiss or tap. */
function ToastItem({
  item,
  onDismiss,
}: {
  item: Toast;
  onDismiss: (id: string) => void;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  const { container, iconColor, Icon } = STYLES[item.kind];

  const close = useCallback(() => {
    if (reduced) {
      onDismiss(item.id);
      return;
    }
    progress.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(onDismiss)(item.id);
    });
  }, [reduced, onDismiss, item.id, progress]);

  useEffect(() => {
    progress.value = reduced ? 1 : withTiming(1, { duration: 220 });
    const timer = setTimeout(close, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [close, reduced, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (progress.value - 1) * 16 }],
  }));

  return (
    <Animated.View style={style}>
      <PressableScale
        haptic="none"
        onPress={close}
        accessibilityRole="alert"
        accessibilityLabel={item.message}
        className={`flex-row items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lg ${container}`}>
        <Icon size={18} color={iconColor} strokeWidth={2.5} />
        <Text variant="secondary" className="flex-1 font-body-medium text-ivory">
          {item.message}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

/**
 * Renders the active toast stack — mounted once, at the app root, above all
 * screens. `box-none` lets touches through everywhere except the toasts.
 */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0 }}
      className="gap-2 px-4">
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </View>
  );
}

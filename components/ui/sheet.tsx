import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { motion } from '@/constants/brand';
import { useReducedMotion } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Optional heading shown above the content. */
  title?: string;
  children: ReactNode;
};

/**
 * Bottom sheet — the project's surface for confirms, action sheets and
 * pickers. Used in place of `Alert.alert` everywhere (CLAUDE.md anti-pattern).
 *
 * The panel slides up from the bottom while the backdrop fades in; both
 * reverse on close. The sheet stays mounted through the exit animation, then
 * unmounts itself.
 */
export function Sheet({ visible, onClose, title, children }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [rendered, setRendered] = useState(visible);

  const translateY = useSharedValue(height);
  const backdrop = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      const duration = reduced ? 0 : motion.default;
      translateY.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      backdrop.value = withTiming(1, { duration });
    } else if (rendered) {
      const duration = reduced ? 0 : motion.micro;
      backdrop.value = withTiming(0, { duration });
      translateY.value = withTiming(height, { duration }, (finished) => {
        if (finished) runOnJS(setRendered)(false);
      });
    }
  }, [visible, rendered, reduced, height, translateY, backdrop]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  if (!rendered) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <AnimatedPressable
          style={backdropStyle}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="absolute inset-0 bg-ink/40"
        />
        <Animated.View
          style={[panelStyle, { paddingBottom: insets.bottom + 12 }]}
          className="rounded-t-3xl border-t border-border bg-surface">
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-borderStrong" />
          </View>
          {title ? (
            <Text variant="title" className="px-5 pb-1 pt-4">
              {title}
            </Text>
          ) : null}
          <View className="px-5 pt-3">{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

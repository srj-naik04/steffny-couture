import { type ComponentProps } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { pressSpring } from '@/constants/brand';
import { haptics, type HapticKind } from '@/lib/haptics';
import { useReducedMotion } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = ComponentProps<typeof Pressable> & {
  /** Haptic fired on press-in. `'none'` to suppress. Defaults to `selection`. */
  haptic?: HapticKind | 'none';
};

/**
 * The project's single tappable primitive — every interactive element goes
 * through here, never a raw `Pressable` in a screen. Scales to 0.97 with a
 * spring on press and fires a haptic on press-in. Respects reduce-motion.
 */
export function PressableScale({ haptic = 'selection', onPressIn, onPressOut, ...props }: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: reduced ? [] : [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...props}
      style={[props.style, animatedStyle]}
      onPressIn={(e) => {
        if (haptic !== 'none') haptics[haptic]();
        scale.value = withSpring(0.97, pressSpring);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, pressSpring);
        onPressOut?.(e);
      }}
    />
  );
}

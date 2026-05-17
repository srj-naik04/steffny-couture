import { type ReactNode, useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/constants/brand';
import { useReducedMotion } from '@/lib/motion';

type Props = {
  children: ReactNode;
  /** Stagger delay in ms — pass `index * 40` for a list (CLAUDE.md §3.5). */
  delay?: number;
  className?: string;
};

/**
 * Entrance wrapper — content fades and rises into place once. Used to give
 * list items the staggered fade+rise entrance the design system calls for.
 * Renders statically (no motion) when reduce-motion is on.
 */
export function FadeInView({ children, delay = 0, className }: Props) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: motion.default,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [reduced, delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }));

  return (
    <Animated.View style={style} className={className}>
      {children}
    </Animated.View>
  );
}

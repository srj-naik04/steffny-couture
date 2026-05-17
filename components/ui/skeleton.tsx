import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/lib/motion';

/**
 * Shimmer placeholder for first-paint loading — the project's loading state
 * of choice (skeletons over spinners, brand skill). Size it with `className`
 * (e.g. `"h-5 w-32"`). The looping pulse is the one permitted infinite
 * animation; it falls back to a static block when reduce-motion is on.
 */
export function Skeleton({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [reduced, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0.6 : opacity.value,
  }));

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={style}
      className={`rounded-xl bg-surfaceAlt ${className ?? ''}`}
    />
  );
}

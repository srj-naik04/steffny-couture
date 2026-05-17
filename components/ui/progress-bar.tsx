import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/constants/brand';
import { useReducedMotion } from '@/lib/motion';

type Props = {
  /** Completion from 0 to 1. */
  progress: number;
  className?: string;
};

/**
 * Animated progress bar — the booking wizard's step indicator. The fill width
 * eases to each new value over 300ms (CLAUDE.md §3.5); reduce-motion snaps it.
 */
export function ProgressBar({ progress, className }: Props) {
  const reduced = useReducedMotion();
  const value = useSharedValue(Math.min(1, Math.max(0, progress)));

  useEffect(() => {
    const clamped = Math.min(1, Math.max(0, progress));
    value.value = reduced
      ? clamped
      : withTiming(clamped, {
          duration: motion.default,
          easing: Easing.out(Easing.cubic),
        });
  }, [progress, reduced, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(progress * 100), min: 0, max: 100 }}
      className={`h-1.5 overflow-hidden rounded-full bg-surfaceAlt ${className ?? ''}`}>
      <Animated.View style={fillStyle} className="h-full rounded-full bg-rose" />
    </View>
  );
}

import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors, delightSpring } from '@/constants/brand';
import { haptics } from '@/lib/haptics';
import { useReducedMotion } from '@/lib/motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Stroke length of the check path — a touch over the true length. */
const CHECK_LENGTH = 64;

/**
 * The booking-confirmed moment (CLAUDE.md §3.5): the rose disc springs in, a
 * soft glow expands and fades, and the check-mark strokes on. Fires a success
 * haptic. Reduce-motion renders the final, static state.
 */
export function SuccessCheck() {
  const reduced = useReducedMotion();
  const offset = useSharedValue(reduced ? 0 : CHECK_LENGTH);
  const discScale = useSharedValue(reduced ? 1 : 0.5);
  const glow = useSharedValue(0);

  useEffect(() => {
    haptics.success();
    if (reduced) return;
    discScale.value = withSpring(1, delightSpring);
    glow.value = withSequence(
      withTiming(0.35, { duration: 220 }),
      withTiming(0, { duration: 520 }),
    );
    offset.value = withDelay(
      200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );
  }, [reduced, offset, discScale, glow]);

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ scale: discScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value }],
  }));
  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <View className="h-28 w-28 items-center justify-center">
      <Animated.View
        style={glowStyle}
        className="absolute h-28 w-28 rounded-full bg-rose"
      />
      <Animated.View
        style={discStyle}
        className="h-24 w-24 items-center justify-center rounded-full bg-rose">
        <Svg width={88} height={88} viewBox="0 0 96 96">
          <AnimatedPath
            d="M28 50 L43 65 L69 34"
            stroke={colors.ivory}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={CHECK_LENGTH}
            animatedProps={checkProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

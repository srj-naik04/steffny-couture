---
name: motion-and-haptics
description: Use this skill whenever adding animations, transitions, press feedback, gesture handling, or haptic vibrations in the Steffny Couture app. Fires for any code involving Reanimated, Moti, Gesture Handler, Expo Haptics, transitions, or anything visually moving. Enforces motion vocabulary (durations, easings, springs), haptics taxonomy, the reduce-motion rule, and the "intentional motion only" principle.
---

# Motion & Haptics — Build Conventions

Motion is part of the brand. Done well, it makes a £1,800 quote feel obvious. Done poorly, it makes the app feel like a 2016 hackathon project.

## Stack

- **Reanimated 3** — all UI thread animations
- **Moti** — declarative wrapper on Reanimated for simple cases (`<MotiView animate={...}>`)
- **React Native Gesture Handler** — pans, drags, swipes
- **Expo Haptics** — tactile feedback

❌ Never use:
- The legacy `Animated` API
- `LayoutAnimation` (unpredictable, doesn't respect reduce-motion)
- `setTimeout` to trigger animations
- Lottie unless explicitly approved (heavy, hard to theme)

## Motion Vocabulary

| Bucket | Duration | Easing | When |
|---|---|---|---|
| Micro | 150–200ms | `Easing.out(Easing.cubic)` | chip select, toggle, hover-equivalent |
| Default | 280–320ms | `Easing.out(Easing.cubic)` | sheet open, fade in, list item enter |
| Page | 400–500ms | `Easing.bezier(0.25, 0.1, 0.25, 1)` | screen transitions |
| Delight (spring) | n/a | `{ damping: 18, stiffness: 180 }` | success check, FAB appear, drag pickup |
| Tight spring | n/a | `{ damping: 14, stiffness: 280 }` | press scale |

**Hard rule:** every animation falls into one of these buckets. If you find yourself reaching for 600ms or `Easing.bounce`, stop and rethink.

## The `useReducedMotion` Hook

Every animation must respect the system reduce-motion preference.

```ts
// lib/motion.ts
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}
```

Use it everywhere:
```tsx
const reduced = useReducedMotion();
const animatedStyle = useAnimatedStyle(() => ({
  transform: reduced ? [] : [{ scale: scale.value }],
  opacity: opacity.value, // opacity is generally fine; transforms are what to skip
}));
```

## Standard Animation Patterns

### Entrance: FadeInView
```tsx
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

<Animated.View entering={FadeInDown.duration(300).delay(60)}>
  <Card>...</Card>
</Animated.View>
```

### List stagger
```tsx
{items.map((item, i) => (
  <Animated.View
    key={item.id}
    entering={FadeInDown.duration(300).delay(i * 40)}
    layout={LinearTransition.springify().damping(18).stiffness(180)}
  >
    <BookingCard {...item} />
  </Animated.View>
))}
```

Cap delay at ~400ms total — for lists over 10 items, drop the per-item delay.

### Press feedback: PressableScale
Use `PressableScale` from `/components/ui/PressableScale.tsx` for every interactive surface. See `expo-react-native` skill for the implementation.

### Bottom sheet
```tsx
import { BottomSheetModal } from '@gorhom/bottom-sheet';
// Snap points, backdrop, gesture-driven dismiss, all from @gorhom/bottom-sheet
```

### Success check (the moment that sells)
SVG path with `strokeDasharray` animated from full to 0:

```tsx
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function SuccessCheck() {
  const offset = useSharedValue(48);

  useEffect(() => {
    offset.value = withTiming(0, { duration: 400 });
    haptics.success();
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <Svg width={64} height={64} viewBox="0 0 24 24">
      <AnimatedPath
        d="M5 12l4 4 10-10"
        stroke="#7C2D3E"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={48}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
```

Pair with a soft radial glow expanding from centre (separate Reanimated view with `scale` and `opacity` interpolating).

### Progress bar (wizard)
```tsx
const progress = useSharedValue(0);
useEffect(() => {
  progress.value = withTiming(currentStep / totalSteps, { duration: 300 });
}, [currentStep]);

const style = useAnimatedStyle(() => ({
  width: `${progress.value * 100}%`,
}));

<View className="h-1 bg-border rounded-full overflow-hidden">
  <Animated.View style={[style]} className="h-full bg-rose rounded-full" />
</View>
```

### Skeleton shimmer
```tsx
const x = useSharedValue(-200);
useEffect(() => {
  x.value = withRepeat(withTiming(200, { duration: 1200 }), -1, false);
}, []);

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }],
}));
```
Stop the shimmer when `reduced` — show a static muted background instead.

## Haptics Taxonomy

Wrap Expo Haptics in `/lib/haptics.ts`:

```ts
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isAndroidLowEnd = Platform.OS === 'android' && Platform.Version < 30;

export const haptics = {
  selection: () => !isAndroidLowEnd && Haptics.selectionAsync(),
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

### When to use each

| Type | Trigger |
|---|---|
| `selection` | Every button press-in (via `PressableScale`); chip tap; tab switch |
| `light` | Toggle on/off; minor confirms |
| `medium` | "Next" in wizard; status change in kanban; pull-to-refresh fire |
| `heavy` | Rarely. Drag pickup. Maybe long-press menu open. |
| `success` | Booking confirmed; status set to "ready"; save successful |
| `warning` | Destructive confirm appearing (before user confirms); over-limit warnings |
| `error` | Network failure; validation error after retry; permission denied |

### Rules
- **Never haptic on screen entry** — only on user-initiated actions
- **Never haptic without visual feedback** — they should reinforce, not announce
- **Never two haptics in quick succession** — looks broken
- **Respect OS haptic settings** — Expo Haptics already does this on iOS; on older Androids we suppress entirely

## Gestures

Gesture Handler is for non-trivial interactions:
- Kanban drag-and-drop
- Swipe-to-cancel on booking cards
- Pinch-zoom on photo viewer
- Pull-to-refresh (use the built-in `RefreshControl` though — simpler)

### Standard Kanban drag

See the implementation in Phase 5 of CLAUDE.md. Key elements:
- `Gesture.Pan()` with `runOnJS` for cross-thread state updates
- `withSpring` for the lift animation
- Haptics: `heavy` on pickup, `medium` on column change, `success` on successful drop

## The "Intentional Motion Only" Rule

Before adding any animation, ask: **what state change am I communicating?**

- ✅ "Item is being added to the list" → fade-in + slight rise
- ✅ "Status changed" → pill colour cross-fade
- ✅ "User tapped a button" → scale press
- ✅ "Modal is opening" → slide up
- ❌ "Looks cool" → cut it
- ❌ "All my pages feel boring" → fix the layout/copy, not motion
- ❌ "I want delight" → delight is earned by *less* motion, not more

## Anti-Patterns

- ❌ `setTimeout` to delay animations — use `withDelay` or `entering.delay()`
- ❌ Animating `width`/`height` without `layout` prop on the parent
- ❌ Long staggered list animations (>500ms total) — feels sluggish
- ❌ Bouncy easings on functional UI (forms, lists)
- ❌ Continuous loops outside of skeleton shimmer (drains battery, distracts)
- ❌ Animations during scroll (`onScroll` driving animations) without `useNativeDriver`/Reanimated worklets — janks the scroll
- ❌ Haptic without animation, or animation without haptic, for the same action — they should pair
- ❌ Manual `Animated.Value` (legacy API) — use Reanimated only
- ❌ `LayoutAnimation` — non-deterministic
- ❌ Forgetting `useReducedMotion()` — accessibility fail

## Quick Reference

```ts
// Standard imports
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, withRepeat,
  FadeIn, FadeInDown, FadeOut, LinearTransition,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { haptics } from '@/lib/haptics';
import { useReducedMotion } from '@/lib/motion';
```

```ts
// Standard spring configs
const PRESS_SPRING = { damping: 14, stiffness: 280 };
const DELIGHT_SPRING = { damping: 18, stiffness: 180 };

// Standard timing configs
const MICRO = { duration: 180, easing: Easing.out(Easing.cubic) };
const DEFAULT = { duration: 300, easing: Easing.out(Easing.cubic) };
const PAGE = { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
```

---
name: expo-react-native
description: Use this skill whenever writing or editing React Native / Expo code — screens, components, navigation, animations, native APIs, styling, or platform-specific code. Fires for any file in `/app/`, `/components/`, or any `.tsx` outside web-only contexts. Enforces the "no rework for web" architecture, NativeWind-only styling, the platform abstraction layer, and Expo SDK 52+ conventions.
---

# Expo + React Native — Build Conventions

The single most important rule for this project: **iOS today, Android tomorrow, web later — all from one codebase, with no screen rewrites.**

## The Three Sacred Rules

### Rule 1 — No direct `react-native` imports in screens

**Bad:**
```tsx
// app/(customer)/index.tsx
import { View, Text, Pressable } from 'react-native';

export default function Home() {
  return <View><Text>Hi</Text></View>;
}
```

**Good:**
```tsx
// app/(customer)/index.tsx
import { Box, Text } from '@/components/ui';

export default function Home() {
  return <Box><Text>Hi</Text></Box>;
}
```

Screens see only the design system. Component internals can branch on `Platform.OS` later; screens never have to.

### Rule 2 — NativeWind only for styling

**Bad:**
```tsx
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({ container: { padding: 16, backgroundColor: '#FAF7F2' } });
<View style={styles.container} />
```

**Good:**
```tsx
<Box className="p-4 bg-ivory" />
```

The only legitimate uses of inline `style={{...}}`:
- Dynamic numeric values that can't be Tailwind classes (e.g., `style={{ width: progress * 200 }}`)
- Reanimated `useAnimatedStyle` outputs

Anything else — use `className`.

### Rule 3 — Business logic in `/features/<feature>/`, never in screens

Screens are thin. They compose components and call hooks. They do not contain:
- Supabase queries (those live in `/features/*/api/`)
- Validation logic (Zod schemas in `/features/*/schemas/`)
- Business calculations (pure functions in `/features/*/lib/`)
- Complex state machines

A screen that's more than ~150 lines is a sign that logic leaked out. Refactor.

## Expo SDK Specifics (SDK 52+)

### Configuration
- **Routing:** Expo Router v4 only. File-based. Use `<Link>` and `router.push()`.
- **New Architecture:** enabled by default in SDK 52. Don't disable unless you have a specific incompatible library.
- **Edge-to-edge** (Android): enabled. Account for status bar via `expo-status-bar` and `SafeAreaView`.
- **Hermes:** enabled. Default.

### Always use Expo modules over community alternatives when available
| ✅ Use | ❌ Don't use |
|---|---|
| `expo-image` | `react-native-fast-image` |
| `expo-image-picker` | `react-native-image-picker` |
| `expo-haptics` | `react-native-haptic-feedback` |
| `expo-notifications` | Firebase Cloud Messaging directly |
| `expo-secure-store` | `react-native-keychain` |
| `expo-file-system` | `react-native-fs` |
| `expo-router` | `@react-navigation/native` directly |

Reason: Expo modules survive Expo Go (your demo path) without `prebuild`. Community modules often require ejecting.

### Storage hierarchy
- **MMKV** (`react-native-mmkv`) — fast key-value, app preferences, cached lookups, Zustand persistence
- **Expo SecureStore** — auth tokens, anything sensitive
- **Supabase Storage** — user-uploaded photos, large files
- ❌ **AsyncStorage** — never. Slow, unsafe.

## Component Patterns

### The `PressableScale` wrapper
Every tappable element on this project goes through `PressableScale`. Never raw `Pressable` in screens.

```tsx
// components/ui/PressableScale.tsx
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion';
import { haptics } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = React.ComponentProps<typeof Pressable> & {
  haptic?: 'selection' | 'light' | 'medium' | 'success' | 'none';
};

export function PressableScale({ haptic = 'selection', onPressIn, ...props }: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: reduced ? [] : [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      style={[props.style, animatedStyle]}
      onPressIn={(e) => {
        if (haptic !== 'none') haptics[haptic]();
        scale.value = withSpring(0.97, { damping: 14, stiffness: 280 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 280 });
        props.onPressOut?.(e);
      }}
    />
  );
}
```

### Lists: always FlatList for >10 items, ScrollView otherwise
- Set `estimatedItemSize` if items have consistent height
- Use `keyExtractor` returning a stable string (never index)
- Pull-to-refresh: `RefreshControl` with `tintColor` from brand `rose`
- Empty state: `ListEmptyComponent` always provided, never undefined

### Images: Expo Image with caching
```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  placeholder={blurhash}
  recyclingKey={uri}
/>
```

### Safe Area
Use `react-native-safe-area-context`. Wrap each screen's root in `SafeAreaView` with `edges` specified (`['top']` for screens with bottom tabs, `['top','bottom']` for modals).

### Keyboard
`KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` wrapping forms. Or use `react-native-keyboard-controller` for fancier handling later.

## Navigation Patterns (Expo Router v4)

### Route groups
- `(customer)` — public, no auth required
- `(staff)` — auth-gated, role-checked
- `(auth)` — sign-in flow

### Layouts
- Root `_layout.tsx` — providers (QueryClient, Auth, GestureHandlerRoot, ThemeProvider, fonts), splash hold
- Group `_layout.tsx` — stack config, auth guards, common screen options

### Conditional rendering at root
```tsx
// app/_layout.tsx (simplified)
export default function RootLayout() {
  const { session, profile, isLoading } = useAuth();
  if (isLoading) return null; // splash still showing

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {profile?.role && ['tailor','manager','owner'].includes(profile.role) ? (
        <Stack.Screen name="(staff)" />
      ) : (
        <Stack.Screen name="(customer)" />
      )}
      <Stack.Screen name="(auth)/login" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

### Modal presentation for wizards
```tsx
<Stack.Screen
  name="book"
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
    gestureEnabled: true,
  }}
/>
```

## Platform-Specific Code

When you genuinely need platform branches:

```tsx
// ✅ Good: inside a /components/ui component
import { Platform } from 'react-native';
const padding = Platform.select({ ios: 16, android: 12, default: 16 });

// ✅ Better: file-level split
// components/ui/Picker.tsx           ← shared API
// components/ui/Picker.ios.tsx       ← iOS impl
// components/ui/Picker.android.tsx   ← Android impl
// components/ui/Picker.web.tsx       ← web impl (future)
```

The `.ios.tsx` / `.android.tsx` / `.web.tsx` pattern is how Metro picks the right file. Use it for any component with significant per-platform divergence. Screens stay unchanged.

## TypeScript Discipline

- `strict: true`, `noUncheckedIndexedAccess: true` in `tsconfig.json`
- No `any`. Use `unknown` and narrow with a type guard.
- Function components are `function Component({ prop }: Props)` — never `React.FC`.
- Props inline as `type Props = { ... }` — never `interface IProps`.
- Database types come from `npx supabase gen types typescript`. Re-run after every schema change.

## Anti-Patterns (immediate red flags)

- ❌ `import { View, Text } from 'react-native'` in `/app/`
- ❌ `StyleSheet.create({})` anywhere
- ❌ Inline hex colours `style={{ color: '#7C2D3E' }}`
- ❌ `useState` for server data (use TanStack Query)
- ❌ Calling Supabase from a screen directly (use a hook from `/features/`)
- ❌ `Alert.alert()` for confirms (use `<Sheet>`)
- ❌ `setTimeout` for animations (use Reanimated)
- ❌ Manual `Animated.Value` (the old API; we use Reanimated v3 only)
- ❌ Class components
- ❌ `componentDidMount`, `useEffect` for data fetching (TanStack Query handles this)
- ❌ Importing from `@react-navigation/*` directly (Expo Router wraps it)

## When in doubt

If a Stack Overflow answer or a blog post suggests a community library or pattern that conflicts with the above, **trust this skill, not the blog**. This skill is calibrated to the demo-and-ship constraints of the Steffny Couture project. The blog isn't.

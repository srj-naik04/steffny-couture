import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { colors } from '@/constants/brand';
import { useReducedMotion } from '@/lib/motion';

/**
 * A slim banner that appears while the device is offline (CLAUDE.md §7).
 * Mounted once at the app root, pinned above the home indicator. Reads cached
 * data still works; this just makes the dropped connection visible.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const shown = useSharedValue(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const target = offline ? 1 : 0;
    shown.value = reduced ? target : withTiming(target, { duration: 220 });
  }, [offline, reduced, shown]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 24 }],
  }));

  if (!offline) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { position: 'absolute', left: 0, right: 0, bottom: 0 }]}>
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="flex-row items-center justify-center gap-2 bg-ink px-4 pt-2.5">
        <WifiOff size={15} color={colors.ivory} strokeWidth={2} />
        <Text variant="caption" className="text-ivory">
          No connection — changes will sync when you’re back online
        </Text>
      </View>
    </Animated.View>
  );
}

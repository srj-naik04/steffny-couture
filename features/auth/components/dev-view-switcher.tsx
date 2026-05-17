import { router } from 'expo-router';
import { ArrowLeftRight } from 'lucide-react-native';

import { Box, PressableScale, Text } from '@/components/ui';
import { colors } from '@/constants/brand';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useViewOverride } from '@/features/auth/hooks/use-view-override';

/**
 * Dev-only floating control for previewing the customer experience while
 * signed in as staff (CLAUDE.md Phase 2, task 4).
 *
 * Guarded by `__DEV__`, so it is never present in a production build, and
 * only shown to staff — a customer has no other view to switch to.
 */
export function DevViewSwitcher() {
  const { isStaff } = useAuth();
  const forceCustomerView = useViewOverride((s) => s.forceCustomerView);
  const setForceCustomerView = useViewOverride((s) => s.setForceCustomerView);

  if (!__DEV__ || !isStaff) return null;

  const onSwitch = () => {
    const next = !forceCustomerView;
    setForceCustomerView(next);
    router.replace(next ? '/(customer)' : '/(shop)');
  };

  return (
    <Box pointerEvents="box-none" className="absolute inset-x-0 bottom-9 items-center">
      <PressableScale
        haptic="light"
        accessibilityLabel={
          forceCustomerView ? 'Switch to shop view' : 'Switch to customer view'
        }
        onPress={onSwitch}
        className="flex-row items-center gap-2 rounded-full bg-ink/90 px-4 py-2">
        <ArrowLeftRight size={14} color={colors.ivory} strokeWidth={2} />
        <Text variant="caption" className="text-ivory">
          DEV · {forceCustomerView ? 'Switch to shop' : 'Switch to customer'}
        </Text>
      </PressableScale>
    </Box>
  );
}

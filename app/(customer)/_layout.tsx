import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth';
import { useViewOverride } from '@/features/auth/hooks/use-view-override';

/**
 * Customer route group — public, no auth required (CLAUDE.md §2.1).
 *
 * Signed-in staff are routed to the shop group instead, so a returning shop
 * user lands on their dashboard rather than the customer welcome screen. The
 * `__DEV__` view switcher can suspend that redirect to preview this group.
 *
 * The booking wizard (`book`) is presented as a modal over the welcome
 * screen — the conversion flow gets its own focused surface (CLAUDE.md §3.2).
 */
export default function CustomerLayout() {
  const { isStaff } = useAuth();
  const forceCustomerView = useViewOverride((s) => s.forceCustomerView);

  if (isStaff && !forceCustomerView) return <Redirect href="/(shop)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="bookings" />
      <Stack.Screen
        name="book"
        options={{ presentation: 'modal', gestureEnabled: true }}
      />
    </Stack>
  );
}

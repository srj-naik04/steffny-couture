import { Stack } from 'expo-router';

import { colors } from '@/constants/brand';

/** Shop bookings stack — list/kanban/calendar, a booking's detail, and the
 * new-manual-booking form presented as a modal (CLAUDE.md §5.2). */
export default function ShopBookingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.ivory },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="new"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

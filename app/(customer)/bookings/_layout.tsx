import { Stack } from 'expo-router';

import { colors } from '@/constants/brand';

/**
 * Customer "My bookings" stack — the list, a booking's detail, and the
 * reschedule flow presented as a modal over the detail (CLAUDE.md Phase 4).
 */
export default function BookingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.ivory },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen
        name="[id]/reschedule"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

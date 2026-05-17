import { Stack } from 'expo-router';

import { colors } from '@/constants/brand';

/**
 * Booking wizard stack (CLAUDE.md §3.2 / booking-wizard skill). Steps slide in
 * from the right; the system back gesture returns to the previous step with
 * all draft data preserved. The confirmed screen is terminal — its gesture is
 * disabled so the customer can't swipe back into the flow after booking.
 */
export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        contentStyle: { backgroundColor: colors.ivory },
      }}>
      <Stack.Screen
        name="confirmed"
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
    </Stack>
  );
}

import { Stack } from 'expo-router';

import { colors } from '@/constants/brand';

/** Shop customers stack — the list and a customer's history (CLAUDE.md §5.4). */
export default function ShopCustomersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.ivory },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

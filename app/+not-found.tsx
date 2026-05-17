import { router, Stack } from 'expo-router';

import { Box, Button, Screen, Text } from '@/components/ui';

/** Fallback for any unmatched route. */
export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen className="items-center justify-center">
        <Box className="items-center gap-3">
          <Text variant="section" className="text-center">
            Page not found
          </Text>
          <Text variant="body" className="text-center text-inkMuted">
            That page doesn&apos;t exist. Let&apos;s get you back.
          </Text>
          <Box className="mt-2">
            <Button label="Go home" onPress={() => router.replace('/')} />
          </Box>
        </Box>
      </Screen>
    </>
  );
}

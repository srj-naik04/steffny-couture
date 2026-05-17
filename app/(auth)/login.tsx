import { Box, Screen, Text } from '@/components/ui';

/**
 * Phase 0 placeholder sign-in screen. The full email/password flow and
 * password reset are built in Phase 2 (Authentication).
 */
export default function Login() {
  return (
    <Screen className="items-center justify-center">
      <Box className="items-center gap-3">
        <Text variant="section" className="text-center">
          Sign in
        </Text>
        <Text variant="body" className="text-center text-inkMuted">
          Shop staff sign-in is built in Phase 2.
        </Text>
      </Box>
    </Screen>
  );
}

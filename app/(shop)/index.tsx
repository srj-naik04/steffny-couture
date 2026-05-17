import { useState } from 'react';

import { Box, Button, Screen, Text } from '@/components/ui';

import { signOut, useAuth } from '@/features/auth';

/**
 * Phase 0 placeholder shop dashboard. The real "Today" view, kanban and
 * booking management are built in Phase 5.
 *
 * Sign-out lives here for now so the Phase 2 auth loop is testable end to
 * end; Phase 5 moves it into the Settings screen.
 */
export default function ShopDashboard() {
  const { profile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // The (shop) route guard redirects to sign-in once the session clears.
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <Screen className="items-center justify-center">
      <Box className="items-center gap-3">
        <Text variant="caption" className="uppercase text-gold">
          Shop
        </Text>
        <Text variant="section" className="text-center">
          Dashboard
        </Text>
        <Text variant="body" className="text-center text-inkMuted">
          {profile?.full_name
            ? `Signed in as ${profile.full_name}. `
            : 'Signed in. '}
          The daily dashboard, kanban and booking management arrive in Phase 5.
        </Text>
      </Box>

      <Box className="mt-8 w-full max-w-sm">
        <Button
          label="Sign out"
          variant="secondary"
          loading={signingOut}
          onPress={onSignOut}
        />
      </Box>
    </Screen>
  );
}

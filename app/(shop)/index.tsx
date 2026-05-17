import { Box, Screen, Text } from '@/components/ui';

/**
 * Phase 0 placeholder shop dashboard. The real "Today" view, kanban and
 * booking management are built in Phase 5, behind auth from Phase 2.
 */
export default function ShopDashboard() {
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
          Steffi&apos;s workspace. Sign-in and the daily dashboard arrive in
          Phases 2 and 5.
        </Text>
      </Box>
    </Screen>
  );
}

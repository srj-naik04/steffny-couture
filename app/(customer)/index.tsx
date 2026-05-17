import { Box, Button, Screen, Text } from '@/components/ui';
import { shop } from '@/constants/shop';

/**
 * Phase 0 placeholder welcome screen. It exists to prove the foundation is
 * wired — Fraunces + Inter load, NativeWind tokens resolve, the design-system
 * primitives render. Phase 3 replaces this with the real welcome screen.
 */
export default function CustomerHome() {
  return (
    <Screen className="items-center justify-center">
      <Box className="items-center gap-3">
        <Text variant="caption" className="uppercase text-gold">
          Crafted in London
        </Text>
        <Text variant="hero" className="text-center">
          {shop.name}
        </Text>
        <Text variant="body" className="text-center text-inkMuted">
          Alterations, perfected. The foundation is ready — the booking
          experience arrives in Phase 3.
        </Text>
      </Box>

      <Box className="mt-8 w-full max-w-sm">
        <Button label="Book an alteration" onPress={() => {}} disabled />
      </Box>
    </Screen>
  );
}

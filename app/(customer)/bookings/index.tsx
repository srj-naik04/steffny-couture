import { router } from 'expo-router';
import { CalendarHeart, ChevronLeft } from 'lucide-react-native';

import { Box, EmptyState, PressableScale, Screen, Text } from '@/components/ui';
import { colors } from '@/constants/brand';

import { useBookingDraft } from '@/features/bookings';

/**
 * Customer "My bookings" — placeholder. The booking list and detail screens
 * are built in Phase 4; this stub keeps the welcome screen's "My bookings"
 * action from dead-ending and offers a way into the wizard.
 */
export default function MyBookings() {
  const reset = useBookingDraft((s) => s.reset);

  return (
    <Screen>
      <Box className="flex-row items-center gap-3 pb-2 pt-2">
        <PressableScale
          haptic="selection"
          onPress={() => router.back()}
          accessibilityLabel="Back"
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </PressableScale>
        <Text variant="section">My bookings</Text>
      </Box>

      <EmptyState
        icon={<CalendarHeart size={28} color={colors.rose} strokeWidth={1.75} />}
        title="No bookings yet"
        body="Your alteration appointments will appear here once you book — with live status as Steffi works through them."
        cta={{
          label: 'Book an alteration',
          onPress: () => {
            reset();
            router.push('/book/type');
          },
        }}
      />
    </Screen>
  );
}

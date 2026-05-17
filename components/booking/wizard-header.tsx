import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, PressableScale, ProgressBar, Sheet, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { haptics } from '@/lib/haptics';

import { useBookingDraft } from '@/features/bookings';

/** Total steps shown in the wizard progress indicator. */
export const WIZARD_STEP_COUNT = 6;

type Props = {
  /** 1-based step number, used for the progress bar and the label. */
  step: number;
};

/**
 * Shared wizard header — back control, progress bar, and a close button that
 * confirms before discarding the draft (booking-wizard skill). The back
 * control simply navigates a step back; the draft is never lost that way.
 */
export function WizardHeader({ step }: Props) {
  const reset = useBookingDraft((s) => s.reset);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openDiscard = () => {
    haptics.warning();
    setConfirmOpen(true);
  };

  const discard = () => {
    setConfirmOpen(false);
    reset();
    router.dismissAll();
  };

  return (
    <View className="gap-2 px-5 pb-1 pt-2">
      <View className="flex-row items-center gap-3">
        {step > 1 ? (
          <PressableScale
            haptic="selection"
            onPress={() => router.back()}
            accessibilityLabel="Previous step"
            className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
            <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
          </PressableScale>
        ) : (
          <View className="h-9 w-9" />
        )}

        <ProgressBar progress={step / WIZARD_STEP_COUNT} className="flex-1" />

        <PressableScale
          haptic="none"
          onPress={openDiscard}
          accessibilityLabel="Close booking"
          className="h-9 w-9 items-center justify-center rounded-full bg-surfaceAlt">
          <X size={20} color={colors.ink} strokeWidth={2} />
        </PressableScale>
      </View>
      <Text variant="caption" className="text-inkSubtle">
        Step {step} of {WIZARD_STEP_COUNT}
      </Text>

      <Sheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Discard this booking?">
        <View className="gap-4 pb-1">
          <Text variant="body" className="text-inkMuted">
            Your photos and details won’t be saved.
          </Text>
          <View className="gap-2">
            <Button label="Discard" variant="destructive" onPress={discard} />
            <Button
              label="Keep editing"
              variant="ghost"
              onPress={() => setConfirmOpen(false)}
            />
          </View>
        </View>
      </Sheet>
    </View>
  );
}

import * as Haptics from 'expo-haptics';

/**
 * Haptics — wrapped Expo Haptics, used like seasoning (CLAUDE.md §3.6).
 *
 * Every call is fire-and-forget and swallows errors: a device without a
 * haptic engine, or with system haptics disabled, should never throw.
 * The OS already honours the user's system-level haptic setting.
 */

function safe(run: () => Promise<void>): void {
  run().catch(() => {
    // Haptics are non-essential — ignore unsupported hardware / disabled settings.
  });
}

export const haptics = {
  /** Every button press-in. */
  selection: () => safe(() => Haptics.selectionAsync()),

  /** Toggle, tab switch. */
  light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** Confirming a step (e.g. "Next" in the booking wizard). */
  medium: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Booking submitted, status updated. */
  success: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Destructive confirm. */
  warning: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /** Failed action. */
  error: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
} as const;

export type HapticKind = keyof typeof haptics;

import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/brand';

type Props = {
  children: ReactNode;
  /** Extra classes for the inner content container. */
  className?: string;
  /** Safe-area edges to inset. Defaults to top only (tabbed screens). */
  edges?: readonly Edge[];
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Pull-to-refresh handler. Implies `scroll`. */
  onRefresh?: () => void;
  /** Whether a pull-to-refresh is in flight. */
  refreshing?: boolean;
  /**
   * Lift content above the keyboard — on by default so a footer/primary
   * button never hides behind the keyboard (CLAUDE.md §7). Pass `false` only
   * for a screen that must not shift (rare).
   */
  keyboardAvoiding?: boolean;
};

/**
 * Standard screen shell — ivory background, safe-area insets, `px-5` padding.
 * Screens compose this instead of importing `SafeAreaView` directly so the
 * `/app` layer never touches `react-native` (the "no rework for web" rule).
 *
 * Pass `onRefresh` for pull-to-refresh on list screens. Keyboard avoidance is
 * on by default — typing never hides a button behind the keyboard.
 */
export function Screen({
  children,
  className,
  edges = ['top'],
  scroll = false,
  onRefresh,
  refreshing = false,
  keyboardAvoiding = true,
}: Props) {
  const content = (
    <View className={`flex-1 px-5 ${className ?? ''}`}>{children}</View>
  );

  const body =
    scroll || onRefresh ? (
      <ScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.rose}
              colors={[colors.rose]}
            />
          ) : undefined
        }>
        {content}
      </ScrollView>
    ) : (
      content
    );

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-ivory">
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

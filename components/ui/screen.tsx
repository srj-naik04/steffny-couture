import { type ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
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
};

/**
 * Standard screen shell — ivory background, safe-area insets, `px-5` padding.
 * Screens compose this instead of importing `SafeAreaView` directly so the
 * `/app` layer never touches `react-native` (the "no rework for web" rule).
 *
 * Pass `onRefresh` for pull-to-refresh on list screens (CLAUDE.md §7).
 */
export function Screen({
  children,
  className,
  edges = ['top'],
  scroll = false,
  onRefresh,
  refreshing = false,
}: Props) {
  const content = (
    <View className={`flex-1 px-5 ${className ?? ''}`}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-ivory">
      {scroll || onRefresh ? (
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
      )}
    </SafeAreaView>
  );
}

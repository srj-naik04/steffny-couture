import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  /** Extra classes for the inner content container. */
  className?: string;
  /** Safe-area edges to inset. Defaults to top only (tabbed screens). */
  edges?: readonly Edge[];
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
};

/**
 * Standard screen shell — ivory background, safe-area insets, `px-5` padding.
 * Screens compose this instead of importing `SafeAreaView` directly so the
 * `/app` layer never touches `react-native` (the "no rework for web" rule).
 */
export function Screen({ children, className, edges = ['top'], scroll = false }: Props) {
  const content = (
    <View className={`flex-1 px-5 ${className ?? ''}`}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-ivory">
      {scroll ? (
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

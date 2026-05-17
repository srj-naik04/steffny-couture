import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WizardHeader } from '@/components/booking/wizard-header';

type Props = {
  /** 1-based step number. */
  step: number;
  children: ReactNode;
  /** Pinned footer — typically the step's primary action. */
  footer?: ReactNode;
  /** Scroll the content area. Off for steps that manage their own layout. */
  scroll?: boolean;
};

/**
 * Layout shared by every wizard step: a fixed header with the progress bar, a
 * content area, and an optional pinned footer. Keeps the header and primary
 * action in place while the content between them scrolls.
 */
export function WizardStep({ step, children, footer, scroll = true }: Props) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-ivory">
      <WizardHeader step={step} />
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-3"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5 pt-3">{children}</View>
      )}
      {footer ? (
        <View className="border-t border-border bg-ivory px-5 pb-2 pt-3">
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

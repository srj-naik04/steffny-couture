import { type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors } from '@/constants/brand';
import { type HapticKind } from '@/lib/haptics';
import { PressableScale } from '@/components/ui/pressable-scale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  /** Defaults to `label`. */
  accessibilityLabel?: string;
};

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-rose',
  secondary: 'bg-surface border border-borderStrong',
  ghost: 'bg-transparent',
  destructive: 'bg-surface border border-danger/30',
};

const LABEL_COLOUR: Record<Variant, string> = {
  primary: 'text-ivory',
  secondary: 'text-ink',
  ghost: 'text-rose',
  destructive: 'text-danger',
};

const SPINNER_COLOUR: Record<Variant, string> = {
  primary: colors.ivory,
  secondary: colors.ink,
  ghost: colors.rose,
  destructive: colors.danger,
};

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-3',
  md: 'px-6 py-3.5',
  lg: 'px-7 py-4',
};

const HAPTIC: Record<Variant, HapticKind> = {
  primary: 'medium',
  secondary: 'selection',
  ghost: 'selection',
  destructive: 'warning',
};

/**
 * The primary action component. Wraps `PressableScale` so press feedback and
 * haptics come for free. Use `loading` for async submits — an inline spinner
 * is the one acceptable spinner (brand skill).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  accessibilityLabel,
}: Props) {
  const inactive = disabled || loading;

  return (
    <PressableScale
      haptic={inactive ? 'none' : HAPTIC[variant]}
      onPress={inactive ? () => {} : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`flex-row items-center justify-center gap-2 rounded-full ${CONTAINER[variant]} ${SIZE[size]} ${inactive ? 'opacity-50' : ''} ${className ?? ''}`}>
      {loading ? (
        <ActivityIndicator size="small" color={SPINNER_COLOUR[variant]} />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text
            variant={size === 'sm' ? 'secondary' : 'body'}
            className={`font-body-medium ${LABEL_COLOUR[variant]}`}>
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </PressableScale>
  );
}

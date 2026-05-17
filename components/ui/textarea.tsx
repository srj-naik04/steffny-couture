import { CircleAlert } from 'lucide-react-native';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors } from '@/constants/brand';

type Props = Omit<TextInputProps, 'className' | 'multiline'> & {
  /** Always visible — never use the placeholder as a label (brand rule). */
  label: string;
  error?: string;
  helperText?: string;
  /** Show a "current / max" character counter. Requires `maxLength`. */
  showCount?: boolean;
  /** Classes for the outer container. */
  className?: string;
};

/**
 * Multi-line text input with a visible label and an optional character
 * counter. Grows with content from a comfortable minimum height.
 */
export function Textarea({
  label,
  error,
  helperText,
  showCount = false,
  maxLength,
  value,
  className,
  ...props
}: Props) {
  const count = typeof value === 'string' ? value.length : 0;

  return (
    <View className={`gap-1.5 ${className ?? ''}`}>
      <View className="flex-row items-center justify-between">
        <Text variant="caption" className="uppercase text-inkMuted">
          {label}
        </Text>
        {showCount && maxLength ? (
          <Text variant="caption" className="text-inkSubtle">
            {count}/{maxLength}
          </Text>
        ) : null}
      </View>
      <TextInput
        accessibilityLabel={label}
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
        value={value}
        placeholderTextColor={colors.inkSubtle}
        className={`min-h-28 rounded-xl bg-surfaceAlt px-4 py-3 font-body text-base text-ink ${
          error ? 'border border-danger' : 'border border-transparent'
        }`}
        {...props}
      />
      {error ? (
        <View className="mt-0.5 flex-row items-center gap-1">
          <CircleAlert size={14} color={colors.danger} strokeWidth={2} />
          <Text variant="secondary" className="text-danger">
            {error}
          </Text>
        </View>
      ) : helperText ? (
        <Text variant="secondary" className="text-inkSubtle">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

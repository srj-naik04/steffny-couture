import { CircleAlert } from 'lucide-react-native';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors } from '@/constants/brand';

type Props = Omit<TextInputProps, 'className'> & {
  /** Always visible — never use the placeholder as a label (brand rule). */
  label: string;
  error?: string;
  helperText?: string;
  /** Classes for the outer container. */
  className?: string;
};

/**
 * Labelled text input. The label is always visible above the field; the
 * placeholder is for example content only. Shows an inline error with icon.
 */
export function Input({ label, error, helperText, className, ...props }: Props) {
  return (
    <View className={`gap-1.5 ${className ?? ''}`}>
      <Text variant="caption" className="uppercase text-inkMuted">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.inkSubtle}
        className={`rounded-xl bg-surfaceAlt px-4 py-3 font-body text-base text-ink ${
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

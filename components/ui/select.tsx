import { Check, ChevronDown, CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Sheet } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { colors } from '@/constants/brand';

export type SelectOption = { label: string; value: string };

type Props = {
  /** Always visible — never use the placeholder as a label (brand rule). */
  label: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
};

/**
 * Dropdown field — the trigger matches the `Input` look; tapping it opens a
 * bottom `Sheet` of options. Platform-agnostic, so it works identically on
 * web later (CLAUDE.md §2.1).
 */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className={`gap-1.5 ${className ?? ''}`}>
      <Text variant="caption" className="uppercase text-inkMuted">
        {label}
      </Text>
      <PressableScale
        haptic="selection"
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${selected ? selected.label : placeholder}`}
        className={`flex-row items-center justify-between rounded-xl bg-surfaceAlt px-4 py-3 ${
          error ? 'border border-danger' : 'border border-transparent'
        }`}>
        <Text variant="body" className={selected ? 'text-ink' : 'text-inkSubtle'}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={colors.inkMuted} strokeWidth={2} />
      </PressableScale>

      {error ? (
        <View className="mt-0.5 flex-row items-center gap-1">
          <CircleAlert size={14} color={colors.danger} strokeWidth={2} />
          <Text variant="secondary" className="text-danger">
            {error}
          </Text>
        </View>
      ) : null}

      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View className="pb-2">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <PressableScale
                key={option.value}
                haptic="selection"
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className="flex-row items-center justify-between rounded-xl px-3 py-3.5">
                <Text
                  variant="body"
                  className={isSelected ? 'text-rose' : 'text-ink'}>
                  {option.label}
                </Text>
                {isSelected ? (
                  <Check size={18} color={colors.rose} strokeWidth={2.5} />
                ) : null}
              </PressableScale>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

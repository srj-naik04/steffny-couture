import { ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { formatCurrency } from '@/lib/format';

import { type Customer } from '@/features/customers';

/** Up-to-two-letter initials for the avatar fallback. */
function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] ?? '')
      .join('')
      .toUpperCase() || '·'
  );
}

type Props = {
  customer: Customer;
  onPress: () => void;
};

/** A customer row for the shop's customer list (CLAUDE.md §5.4). */
export function CustomerRow({ customer, onPress }: Props) {
  return (
    <Card onPress={onPress} accessibilityLabel={customer.name}>
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-roseSoft">
          <Text variant="body" className="font-body-semibold text-rose">
            {initials(customer.name)}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text variant="bodyLg" numberOfLines={1}>
            {customer.name}
          </Text>
          <Text variant="secondary" className="text-inkMuted">
            {customer.bookingCount} booking
            {customer.bookingCount === 1 ? '' : 's'}
            {customer.totalSpend > 0
              ? ` · ${formatCurrency(customer.totalSpend)} spent`
              : ''}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
      </View>
    </Card>
  );
}

import { router } from 'expo-router';
import { TriangleAlert, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';

import { CustomerRow } from '@/components/shop/customer-row';
import { Box, EmptyState, Input, Screen, Skeleton, Text } from '@/components/ui';
import { colors } from '@/constants/brand';
import { toDialableDigits } from '@/lib/format';

import { useShopBookings } from '@/features/bookings';
import { aggregateCustomers } from '@/features/customers';

/**
 * Shop customers (CLAUDE.md §5.4) — every unique customer, aggregated from the
 * bookings list, searchable by name or phone.
 */
export default function ShopCustomers() {
  const { data, isLoading, isError, refetch, isRefetching } = useShopBookings();
  const [search, setSearch] = useState('');

  const customers = useMemo(
    () => aggregateCustomers(data ?? []),
    [data],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    const digits = toDialableDigits(query);
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        (customer.phone
          ? toDialableDigits(customer.phone).includes(digits)
          : false),
    );
  }, [customers, search]);

  if (isLoading) {
    return (
      <Screen>
        <Box className="pb-2 pt-2">
          <Text variant="section">Customers</Text>
        </Box>
        <Box className="mt-4 gap-3">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-20 w-full rounded-2xl" />
          ))}
        </Box>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Box className="pb-2 pt-2">
          <Text variant="section">Customers</Text>
        </Box>
        <EmptyState
          icon={<TriangleAlert size={28} color={colors.rose} strokeWidth={1.75} />}
          title="Couldn't load customers"
          body="Check your connection and try again."
          cta={{ label: 'Try again', onPress: () => void refetch() }}
        />
      </Screen>
    );
  }

  if (customers.length === 0) {
    return (
      <Screen onRefresh={() => void refetch()} refreshing={isRefetching}>
        <Box className="pb-2 pt-2">
          <Text variant="section">Customers</Text>
        </Box>
        <EmptyState
          icon={<Users size={28} color={colors.rose} strokeWidth={1.75} />}
          title="No customers yet"
          body="Customers appear here as bookings come in."
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      className="pb-8"
      onRefresh={() => void refetch()}
      refreshing={isRefetching}>
      <Box className="pb-2 pt-2">
        <Text variant="section">Customers</Text>
      </Box>

      <Box className="mt-3 gap-3">
        <Input
          label="Search"
          placeholder="Name or phone"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />

        {filtered.length === 0 ? (
          <Box className="py-16">
            <Text variant="body" className="text-center text-inkMuted">
              No customers match.
            </Text>
          </Box>
        ) : (
          filtered.map((customer) => (
            <CustomerRow
              key={customer.key}
              customer={customer}
              onPress={() =>
                router.push(
                  `/customers/${encodeURIComponent(customer.key)}`,
                )
              }
            />
          ))
        )}
      </Box>
    </Screen>
  );
}

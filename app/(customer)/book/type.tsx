import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { AlterationTypeCard } from '@/components/booking/alteration-type-card';
import { WizardStep } from '@/components/booking/wizard-step';
import { Box, Text } from '@/components/ui';
import { ALTERATION_TYPES } from '@/constants/alteration-types';
import { formatPriceRange } from '@/lib/format';

import { useAlterationTypes, useBookingDraft } from '@/features/bookings';

/**
 * Step 1 — choose what needs altering. Selecting a card auto-advances; there
 * is no separate "Next" when the step holds a single decision (booking-wizard
 * skill). The static catalogue renders instantly and is replaced by the live
 * `alteration_types` rows once the query resolves.
 */

type TypeOption = {
  id: string;
  label: string;
  icon: string | null;
  priceLabel: string;
};

function priceLabelOf(min: number | null, max: number | null): string {
  if (min === null || max === null) return 'Priced per job';
  return formatPriceRange(min, max);
}

function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2));
  return pairs;
}

export default function TypeStep() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === '1';

  const { data } = useAlterationTypes();
  const alterationTypeId = useBookingDraft((s) => s.draft.alterationTypeId);
  const setField = useBookingDraft((s) => s.setField);

  const options = useMemo<TypeOption[]>(() => {
    if (data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        label: row.label,
        icon: row.icon,
        priceLabel: priceLabelOf(
          row.estimated_min_price,
          row.estimated_max_price,
        ),
      }));
    }
    return ALTERATION_TYPES.map((type) => ({
      id: type.id,
      label: type.label,
      icon: type.icon,
      priceLabel: formatPriceRange(
        type.estimatedMinPrice,
        type.estimatedMaxPrice,
      ),
    }));
  }, [data]);

  const onSelect = (id: string) => {
    setField('alterationTypeId', id);
    // Hold briefly so the selected state is seen before the transition.
    setTimeout(() => {
      if (isEditing) router.navigate('/book/review');
      else router.push('/book/photos');
    }, 180);
  };

  return (
    <WizardStep step={1}>
      <Box className="gap-1.5">
        <Text variant="hero">What needs altering?</Text>
        <Text variant="body" className="text-inkMuted">
          Pick the closest match — you can describe the detail in a moment.
        </Text>
      </Box>

      <Box className="mt-6 gap-3">
        {chunkPairs(options).map((pair, index) => (
          <Box key={pair[0]?.id ?? index} className="flex-row gap-3">
            {pair.map((option) => (
              <AlterationTypeCard
                key={option.id}
                label={option.label}
                priceLabel={option.priceLabel}
                iconName={option.icon}
                selected={option.id === alterationTypeId}
                onPress={() => onSelect(option.id)}
              />
            ))}
            {pair.length === 1 ? <Box className="flex-1" /> : null}
          </Box>
        ))}
      </Box>
    </WizardStep>
  );
}

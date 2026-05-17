import { useQuery } from '@tanstack/react-query';

import {
  DEFAULT_SLOT_DURATION_MINUTES,
  openingHours,
} from '@/constants/shop';

import { getShopSettings } from '@/features/bookings/api/shop-settings';
import { shopSettingsKeys } from '@/features/bookings/queries';
import { type ShopHours } from '@/features/bookings/types';

/**
 * The singleton shop settings row. Reference data — cached indefinitely
 * (tanstack-query skill).
 */
export function useShopSettings() {
  return useQuery({
    queryKey: shopSettingsKeys.all,
    queryFn: getShopSettings,
    staleTime: Infinity,
  });
}

/**
 * Scheduling config the wizard's schedule step needs, with static fallbacks
 * from `/constants/shop` so the step works before the row loads (or if it is
 * missing).
 */
export function useShopHours(): {
  hours: ShopHours;
  slotMinutes: number;
  blockedDates: string[];
} {
  const { data } = useShopSettings();
  return {
    hours: (data?.hours as ShopHours | undefined) ?? openingHours,
    slotMinutes: data?.slot_duration_minutes ?? DEFAULT_SLOT_DURATION_MINUTES,
    blockedDates: data?.blocked_dates ?? [],
  };
}

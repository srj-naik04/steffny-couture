import { useMutation, useQueryClient } from '@tanstack/react-query';

import { shopSettingsKeys } from '@/features/bookings/queries';
import { type ShopSettingsRow } from '@/features/bookings';
import { updateShopSettings } from '@/features/settings/api/settings';
import { type Database } from '@/types/database';

type ShopSettingsUpdate =
  Database['public']['Tables']['shop_settings']['Update'];

/** Save a change to the shop settings (hours, blocked dates, slot length). */
export function useUpdateShopSettings() {
  const queryClient = useQueryClient();

  return useMutation<ShopSettingsRow, Error, ShopSettingsUpdate>({
    mutationFn: updateShopSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(shopSettingsKeys.all, settings);
    },
  });
}

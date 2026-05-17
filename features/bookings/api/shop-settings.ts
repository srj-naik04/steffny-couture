import { supabase } from '@/lib/supabase';

import { type ShopSettingsRow } from '@/features/bookings/types';

/**
 * The singleton shop settings row (id = 1). Returns `null` if the row is
 * missing so the caller can fall back to the static `/constants/shop` values.
 */
export async function getShopSettings(): Promise<ShopSettingsRow | null> {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

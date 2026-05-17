import { supabase } from '@/lib/supabase';

import { type ShopSettingsRow } from '@/features/bookings';
import { type Database } from '@/types/database';

type ShopSettingsUpdate =
  Database['public']['Tables']['shop_settings']['Update'];

/**
 * Shop settings writes — opening hours, blocked dates, slot duration
 * (CLAUDE.md §5.5). The singleton row is `id = 1`; manager RLS gates writes.
 */
export async function updateShopSettings(
  patch: ShopSettingsUpdate,
): Promise<ShopSettingsRow> {
  const { data, error } = await supabase
    .from('shop_settings')
    .update(patch)
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;
  return data;
}

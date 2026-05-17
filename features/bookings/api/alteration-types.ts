import { supabase } from '@/lib/supabase';

import { type AlterationTypeRow } from '@/features/bookings/types';

/** The active alteration types, ordered for the type-picker grid. */
export async function getAlterationTypes(): Promise<AlterationTypeRow[]> {
  const { data, error } = await supabase
    .from('alteration_types')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

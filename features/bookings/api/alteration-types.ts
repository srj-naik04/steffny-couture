import { supabase } from '@/lib/supabase';

import { type AlterationTypeRow } from '@/features/bookings/types';
import { type Database } from '@/types/database';

type AlterationTypeUpsert =
  Database['public']['Tables']['alteration_types']['Insert'];

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

/** Every alteration type, active or not — the shop settings manager. */
export async function getAllAlterationTypes(): Promise<AlterationTypeRow[]> {
  const { data, error } = await supabase
    .from('alteration_types')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Create or update an alteration type (matched on its `id`). */
export async function upsertAlterationType(
  row: AlterationTypeUpsert,
): Promise<void> {
  const { error } = await supabase.from('alteration_types').upsert(row);
  if (error) throw error;
}

/** Toggle an alteration type's visibility in the booking wizard. */
export async function setAlterationTypeActive(
  id: string,
  active: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('alteration_types')
    .update({ active })
    .eq('id', id);
  if (error) throw error;
}

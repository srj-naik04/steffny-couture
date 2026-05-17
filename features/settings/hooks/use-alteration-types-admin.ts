import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAllAlterationTypes,
  setAlterationTypeActive,
  upsertAlterationType,
} from '@/features/bookings/api/alteration-types';
import { alterationTypeKeys } from '@/features/bookings/queries';
import { type Database } from '@/types/database';

type AlterationTypeUpsert =
  Database['public']['Tables']['alteration_types']['Insert'];

/** Every alteration type, including inactive ones, for the settings manager. */
export function useAllAlterationTypes() {
  return useQuery({
    queryKey: alterationTypeKeys.admin,
    queryFn: getAllAlterationTypes,
    staleTime: 60_000,
  });
}

/** Both alteration-type caches — the wizard's and the manager's. */
function useInvalidateAlterationTypes() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: alterationTypeKeys.all });
  };
}

/** Create or edit an alteration type. */
export function useUpsertAlterationType() {
  const invalidate = useInvalidateAlterationTypes();

  return useMutation<void, Error, AlterationTypeUpsert>({
    mutationFn: upsertAlterationType,
    onSuccess: invalidate,
  });
}

/** Show or hide an alteration type in the booking wizard. */
export function useSetAlterationTypeActive() {
  const invalidate = useInvalidateAlterationTypes();

  return useMutation<void, Error, { id: string; active: boolean }>({
    mutationFn: ({ id, active }) => setAlterationTypeActive(id, active),
    onSuccess: invalidate,
  });
}

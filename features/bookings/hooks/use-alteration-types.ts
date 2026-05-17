import { useQuery } from '@tanstack/react-query';

import { getAlterationTypes } from '@/features/bookings/api/alteration-types';
import { alterationTypeKeys } from '@/features/bookings/queries';

/**
 * The alteration-type catalogue. Reference data — cached indefinitely and
 * invalidated manually when the shop edits it (tanstack-query skill).
 */
export function useAlterationTypes() {
  return useQuery({
    queryKey: alterationTypeKeys.all,
    queryFn: getAlterationTypes,
    staleTime: Infinity,
  });
}

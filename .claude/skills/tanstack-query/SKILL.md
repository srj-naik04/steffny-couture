---
name: tanstack-query
description: Use this skill whenever working with TanStack Query (React Query) — defining queries, mutations, query keys, cache invalidation, optimistic updates, infinite scroll, or debugging cache issues. Fires for any file in `/features/*/hooks/` or any code importing from `@tanstack/react-query`. Enforces query key conventions, cache time defaults, optimistic update patterns, and the project's specific data-fetching rules.
---

# TanStack Query Conventions

TanStack Query owns all server state. `useState` for server data is forbidden.

## Client Setup

```ts
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

// Wire RN's AppState to focus manager
AppState.addEventListener('change', (status) => {
  focusManager.setFocused(status === 'active');
});

// Wire NetInfo to online manager
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30s default — adjust per query
      gcTime: 5 * 60_000,          // 5 min cache retention
      retry: 2,
      refetchOnWindowFocus: true,  // refetch when app foregrounded
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

Wrap the app in `<QueryClientProvider client={queryClient}>` at root.

## Query Key Convention

**The single most important thing to get right.** Inconsistent keys = invalidation hell.

### Structure
Always an array. Always starts with the entity name. Increasingly specific from left to right.

```ts
['bookings']                                // all bookings
['bookings', 'list']                        // any list (with or without filters)
['bookings', 'list', { status: 'new' }]     // filtered list
['bookings', 'detail', bookingId]           // single booking
['bookings', 'detail', bookingId, 'history']// nested resource
['customers', 'list']
['customers', 'detail', customerId]
['shop-settings']
['alteration-types']
```

### The Query Key Factory Pattern (use this everywhere)

```ts
// features/bookings/queries.ts
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: BookingFilters) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  history: (id: string) => [...bookingKeys.detail(id), 'history'] as const,
};
```

Why a factory:
- TypeScript autocompletes the keys
- Invalidation is precise: `queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })` invalidates all lists regardless of filter
- Refactoring the key shape only touches one file

## Query Hook Pattern

```ts
// features/bookings/hooks/useBookings.ts
import { useQuery } from '@tanstack/react-query';
import { getBookings } from '../api/getBookings';
import { bookingKeys } from '../queries';

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => getBookings(filters),
    staleTime: 30_000,
  });
}
```

```ts
// features/bookings/hooks/useBooking.ts
export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? 'none'),
    queryFn: () => getBookingById(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}
```

### Stale time guidance
- **Reference data** (alteration_types, shop_settings): `staleTime: Infinity` — invalidate manually on edit
- **Lists**: 30 seconds — quick refresh on focus
- **Details**: 10 seconds — usually paired with realtime
- **Search results**: 0 — always refetch

## Mutation Hook Pattern

```ts
// features/bookings/hooks/useUpdateBookingStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookingStatus } from '../api/updateBookingStatus';
import { bookingKeys } from '../queries';
import { haptics } from '@/lib/haptics';
import { toast } from '@/lib/toast';

export function useUpdateBookingStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: BookingStatus; note?: string }) =>
      updateBookingStatus(id, status, note),

    onMutate: async ({ id, status }) => {
      // Cancel in-flight queries for this booking
      await qc.cancelQueries({ queryKey: bookingKeys.detail(id) });

      // Snapshot previous value
      const previous = qc.getQueryData<Booking>(bookingKeys.detail(id));

      // Optimistic update
      if (previous) {
        qc.setQueryData<Booking>(bookingKeys.detail(id), {
          ...previous,
          status,
          updated_at: new Date().toISOString(),
        });
      }

      return { previous };
    },

    onError: (_err, { id }, context) => {
      // Roll back
      if (context?.previous) {
        qc.setQueryData(bookingKeys.detail(id), context.previous);
      }
      haptics.error();
      toast.error("That didn't go through. Try again?");
    },

    onSuccess: () => {
      haptics.success();
      toast.success('Status updated');
    },

    onSettled: (_data, _err, { id }) => {
      // Always refetch in case server differs from optimistic
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
```

### Use this for
- Booking status changes (instant feel)
- Photo uploads (thumbnail appears immediately)
- Note edits, price quote edits
- Adding to wishlist / favourites
- Anything where the user should not wait

### Don't use for
- Critical financial operations (better to wait for server confirm)
- Operations where the server might reject for non-obvious reasons (better to show pending state)

## Realtime + Query Cache

Pair Supabase Realtime with query cache updates instead of refetching:

```ts
useEffect(() => {
  const channel = supabase
    .channel(`booking:${id}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${id}` },
      (payload) => {
        queryClient.setQueryData<Booking>(bookingKeys.detail(id), payload.new as Booking);
        // Also nudge lists to reflect the change
        queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [id]);
```

## Persistence (offline-first)

For the booking submission specifically — if a user submits without network, we want it to queue and submit when reconnected.

```ts
// In lib/query-client.ts, set up persistence
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'query-persist' });
const persister = createSyncStoragePersister({
  storage: {
    getItem: (k) => mmkv.getString(k) ?? null,
    setItem: (k, v) => mmkv.set(k, v),
    removeItem: (k) => mmkv.delete(k),
  },
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 24 * 60 * 60 * 1000, // 24h
});
```

For mutation persistence (queued retries), wrap the mutation manually or use the `MutationCache` with `defaultOptions.mutations.networkMode = 'offlineFirst'`.

## Anti-Patterns

- ❌ **String query keys**: `useQuery({ queryKey: 'bookings', ... })` — always arrays
- ❌ **Inconsistent keys**: `['bookings', id]` in one file, `['booking', id]` in another — use the factory
- ❌ **Invalidating with too-broad key**: `qc.invalidateQueries()` with no key invalidates EVERYTHING — always scope
- ❌ **Calling `refetch()` from a button**: instead, invalidate the query — TanStack Query handles the rest
- ❌ **Storing query data in `useState`**: never. The cache IS your state.
- ❌ **`useEffect` to trigger queries**: just call `useQuery` with `enabled`
- ❌ **Mutations without `onSettled` invalidation**: stale UI bug guaranteed
- ❌ **Optimistic updates without rollback in `onError`**: UI lies after a failed mutation
- ❌ **Disabling retry blindly** (`retry: false`): you lose resilience. Set it to 1-2 with a smart `retry` function instead.
- ❌ **`refetchOnMount: 'always'` everywhere**: defeats caching. Only use for truly volatile data.

## DevTools

Add `@tanstack/react-query-devtools` for web only (later). For RN dev, use `react-query-native-devtools` — adds a floating dev panel. Wrap behind `__DEV__` check; never ship.

## When Adding a New Query

1. Add the key to the relevant feature's `queries.ts` factory
2. Add the API function in `/features/<feature>/api/`
3. Add the hook in `/features/<feature>/hooks/`
4. Decide stale time based on data volatility
5. If the data can be mutated elsewhere, invalidate this key in those mutations' `onSettled`
6. If realtime is wanted, wire `setQueryData` from the channel handler

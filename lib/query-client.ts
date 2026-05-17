import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client — all server state flows through this.
 *
 * Defaults tuned for a small, mostly-stable dataset: data is considered
 * fresh for a minute, failed queries retry twice, and we don't refetch on
 * every window focus (noisy on mobile). Realtime subscriptions (Phase 4+)
 * keep individual queries live via `setQueryData`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

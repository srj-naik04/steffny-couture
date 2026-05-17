/** TanStack Query keys for the notifications feature (tanstack-query skill). */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (audience: string) => ['notifications', audience] as const,
};

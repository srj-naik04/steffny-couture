/**
 * TanStack Query key factories for the booking feature (tanstack-query skill).
 * Keys are always arrays, entity-first, increasingly specific.
 */

export const alterationTypeKeys = {
  all: ['alteration-types'] as const,
};

export const shopSettingsKeys = {
  all: ['shop-settings'] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  /** Times already taken on a given date. */
  bookedSlots: (dateId: string) =>
    [...bookingKeys.all, 'booked-slots', dateId] as const,
  /** The customer's "My bookings" list — scoped to signed-in vs guest. */
  list: (scope: string) => [...bookingKeys.all, 'list', scope] as const,
  /** One booking's detail. */
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  /** One booking's status history (audit trail). */
  history: (id: string) => [...bookingKeys.all, 'history', id] as const,
  /** Signed URLs for one booking's photos. */
  photos: (id: string) => [...bookingKeys.all, 'photos', id] as const,
};

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
};

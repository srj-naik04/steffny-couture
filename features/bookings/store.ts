import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { draftStorage } from '@/lib/draft-storage';

import { type BookingDraft, type DraftPhoto } from '@/features/bookings/types';

/**
 * The booking-wizard store — the single source of truth for the draft across
 * all six steps (booking-wizard skill). Persisted to disk so the draft
 * survives backgrounding, force-quit and a mid-flow crash.
 *
 * It is reset only on a successful submission or an explicit discard —
 * never on step navigation.
 */

function emptyDraft(): BookingDraft {
  return {
    bookingId: Crypto.randomUUID(),
    alterationTypeId: null,
    photos: [],
    dressType: null,
    description: '',
    brand: '',
    neededBy: null,
    appointmentDate: null,
    appointmentTime: null,
    name: '',
    phone: '',
    email: '',
    saveDetails: false,
  };
}

type WizardStore = {
  draft: BookingDraft;
  /** False until the persisted draft has been read back from disk. */
  hydrated: boolean;
  setField: <K extends keyof BookingDraft>(
    key: K,
    value: BookingDraft[K],
  ) => void;
  patch: (values: Partial<BookingDraft>) => void;
  addPhoto: (photo: DraftPhoto) => void;
  updatePhoto: (id: string, changes: Partial<DraftPhoto>) => void;
  removePhoto: (id: string) => void;
  reset: () => void;
};

export const useBookingDraft = create<WizardStore>()(
  persist(
    (set) => ({
      draft: emptyDraft(),
      hydrated: false,
      setField: (key, value) =>
        set((s) => ({ draft: { ...s.draft, [key]: value } })),
      patch: (values) => set((s) => ({ draft: { ...s.draft, ...values } })),
      addPhoto: (photo) =>
        set((s) => ({
          draft: { ...s.draft, photos: [...s.draft.photos, photo] },
        })),
      updatePhoto: (id, changes) =>
        set((s) => ({
          draft: {
            ...s.draft,
            photos: s.draft.photos.map((p) =>
              p.id === id ? { ...p, ...changes } : p,
            ),
          },
        })),
      removePhoto: (id) =>
        set((s) => ({
          draft: {
            ...s.draft,
            photos: s.draft.photos.filter((p) => p.id !== id),
          },
        })),
      reset: () => set({ draft: emptyDraft() }),
    }),
    {
      name: 'booking-draft',
      storage: createJSONStorage(() => draftStorage),
      // Only the draft is persisted — `hydrated` always starts false.
      partialize: (s) => ({ draft: s.draft }),
      onRehydrateStorage: () => () => {
        useBookingDraft.setState({ hydrated: true });
      },
    },
  ),
);

/**
 * True when the customer has entered something worth offering to resume —
 * powers the welcome screen's "Continue your booking" card.
 */
export function isDraftStarted(d: BookingDraft): boolean {
  return (
    d.alterationTypeId !== null ||
    d.photos.length > 0 ||
    d.description.trim().length > 0 ||
    d.appointmentDate !== null ||
    d.name.trim().length > 0
  );
}

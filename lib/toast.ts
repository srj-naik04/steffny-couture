import { create } from 'zustand';

import { haptics } from '@/lib/haptics';

/**
 * Toast — non-blocking feedback (CLAUDE.md §7). A tiny Zustand store holds the
 * active toasts; `ToastHost` (mounted once at the root) renders them. Call the
 * `toast` helpers from anywhere — screens, hooks, mutations.
 */

export type ToastKind = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
};

type ToastStore = {
  toasts: Toast[];
  show: (kind: ToastKind, message: string) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (kind, message) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: `${Date.now()}-${Math.random()}`, kind, message },
      ],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Fire-and-forget toast helpers. Each kind carries the matching haptic. */
export const toast = {
  success: (message: string) => {
    haptics.success();
    useToastStore.getState().show('success', message);
  },
  error: (message: string) => {
    haptics.error();
    useToastStore.getState().show('error', message);
  },
  info: (message: string) => {
    useToastStore.getState().show('info', message);
  },
};

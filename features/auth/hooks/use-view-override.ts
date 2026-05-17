import { create } from 'zustand';

/**
 * Dev-only view override.
 *
 * Normally signed-in staff are redirected out of the customer group into the
 * shop group. When a developer uses the `__DEV__` view switcher to preview
 * the customer experience, this flag suspends that redirect.
 *
 * In production the switcher never renders, so the flag stays `false` and
 * staff are always routed to the shop group.
 */
type ViewOverrideState = {
  /** When true, staff are allowed to remain in the customer route group. */
  forceCustomerView: boolean;
  setForceCustomerView: (value: boolean) => void;
};

export const useViewOverride = create<ViewOverrideState>((set) => ({
  forceCustomerView: false,
  setForceCustomerView: (value) => set({ forceCustomerView: value }),
}));

import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

/**
 * Motion helpers.
 *
 * `useReducedMotion()` reflects the OS "Reduce Motion" accessibility setting.
 * Every animated component must consult it and fall back to a static state
 * when motion is reduced (CLAUDE.md §3.7).
 */
export function useReducedMotion(): boolean {
  return useReanimatedReducedMotion();
}

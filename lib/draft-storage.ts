import * as FileSystem from 'expo-file-system/legacy';

/**
 * File-backed key/value storage for the booking-wizard Zustand store.
 *
 * The booking-wizard skill specifies MMKV for draft persistence, but MMKV is
 * a native module that breaks the Expo Go demo path — ADR-0006 ruled it out
 * of the auth session for the same reason. This adapter persists the draft to
 * a JSON file in the app's document directory instead: Expo Go-safe, and
 * enough to survive backgrounding, force-quit and a crash mid-flow. See
 * ADR-0007.
 *
 * Shape matches Zustand's async `StateStorage` contract.
 */
const DIR = `${FileSystem.documentDirectory ?? ''}wizard/`;

function fileFor(key: string): string {
  return `${DIR}${encodeURIComponent(key)}.json`;
}

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

export const draftStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const info = await FileSystem.getInfoAsync(fileFor(key));
    if (!info.exists) return null;
    return FileSystem.readAsStringAsync(fileFor(key));
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await ensureDir();
    await FileSystem.writeAsStringAsync(fileFor(key), value);
  },
  removeItem: async (key: string): Promise<void> => {
    await FileSystem.deleteAsync(fileFor(key), { idempotent: true });
  },
};

import * as SecureStore from 'expo-secure-store';

/**
 * Supabase auth-session storage backed by `expo-secure-store`.
 *
 * Why not MMKV (CLAUDE.md spec) or AsyncStorage (forbidden)? MMKV is a native
 * module and does not run in Expo Go — the primary demo path (Phase 8). So we
 * persist the session in the OS keychain/keystore instead: encrypted at rest
 * and Expo Go-compatible. See docs/DECISIONS.md.
 *
 * SecureStore caps a single value at ~2 KB, and a full Supabase session
 * (access token + refresh token + user) routinely exceeds that. This adapter
 * transparently chunks values: the base key holds an index, the payload lives
 * in `<key>.0`, `<key>.1`, … Reads and writes reassemble it. Chunking is
 * applied to every value so reads never have to guess the storage shape.
 */

// Stay comfortably under SecureStore's ~2 KB per-value limit. Supabase tokens
// are ASCII (JWT/base64), so one character is one byte — char-count chunking
// is exact here.
const CHUNK_SIZE = 1800;

type ChunkIndex = { chunks: number };

function chunkKey(key: string, index: number): string {
  return `${key}.${index}`;
}

function parseIndex(raw: string | null): ChunkIndex | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'chunks' in parsed &&
      typeof (parsed as ChunkIndex).chunks === 'number'
    ) {
      return parsed as ChunkIndex;
    }
  } catch {
    // Not an index payload — treated as absent below.
  }
  return null;
}

/** Delete every chunk recorded by an index, then the index itself. */
async function clearChunks(key: string, index: ChunkIndex): Promise<void> {
  const deletions: Promise<void>[] = [];
  for (let i = 0; i < index.chunks; i += 1) {
    deletions.push(SecureStore.deleteItemAsync(chunkKey(key, i)));
  }
  await Promise.all(deletions);
  await SecureStore.deleteItemAsync(key);
}

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const index = parseIndex(await SecureStore.getItemAsync(key));
      if (!index) return null;

      const chunks = await Promise.all(
        Array.from({ length: index.chunks }, (_, i) =>
          SecureStore.getItemAsync(chunkKey(key, i)),
        ),
      );
      // A missing chunk means a partial/corrupt write — treat as no session
      // rather than handing Supabase a truncated token.
      if (chunks.some((c) => c === null)) return null;
      return chunks.join('');
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    // Drop any chunks left by a previous, possibly larger value first.
    const previous = parseIndex(await SecureStore.getItemAsync(key));
    if (previous) await clearChunks(key, previous);

    const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
    const writes: Promise<void>[] = [];
    for (let i = 0; i < count; i += 1) {
      const slice = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      writes.push(SecureStore.setItemAsync(chunkKey(key, i), slice));
    }
    await Promise.all(writes);
    await SecureStore.setItemAsync(key, JSON.stringify({ chunks: count }));
  },

  async removeItem(key: string): Promise<void> {
    const index = parseIndex(await SecureStore.getItemAsync(key));
    if (index) await clearChunks(key, index);
    else await SecureStore.deleteItemAsync(key);
  },
};

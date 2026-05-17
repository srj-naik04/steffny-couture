import { Stack } from 'expo-router';

/** Shop route group — auth-gated in Phase 2 (CLAUDE.md §2.1). */
export default function ShopLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

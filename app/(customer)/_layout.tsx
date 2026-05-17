import { Stack } from 'expo-router';

/** Customer route group — public, no auth required (CLAUDE.md §2.1). */
export default function CustomerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

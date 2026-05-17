import { Stack } from 'expo-router';

/** Auth route group — sign-in flow for shop staff (CLAUDE.md §2.1). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

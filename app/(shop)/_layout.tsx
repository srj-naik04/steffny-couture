import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth';

/**
 * Shop route group — staff only (CLAUDE.md §2.1).
 *
 * Auth has already resolved before any screen renders (RootNavigator holds
 * the splash until then), so a missing staff role here means the visitor is
 * a customer or signed out — send them to sign-in.
 */
export default function ShopLayout() {
  const { isStaff } = useAuth();

  if (!isStaff) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

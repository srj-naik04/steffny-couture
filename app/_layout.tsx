import '@/global.css';

import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/query-client';

import { AuthProvider, useAuth } from '@/features/auth';

// Customer is the public, default experience; staff are routed to the shop
// group by the guard in app/(shop)/_layout.tsx.
export const unstable_settings = {
  initialRouteName: '(customer)',
};

// Hold the native splash until fonts AND the auth session are ready, so text
// never flashes unstyled and a returning shop user never flashes the customer
// screen before the route guard runs.
SplashScreen.preventAutoHideAsync();

/**
 * Renders the navigator once auth has resolved. Lives inside `AuthProvider`
 * so it can read `useAuth()`; keeps the splash up until the session is known.
 */
function RootNavigator() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAF7F2' },
        }}>
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(shop)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Keep the splash up until fonts resolve (or fail — we still boot).
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import { Redirect, Tabs } from 'expo-router';
import { CalendarDays, House, Settings, Users } from 'lucide-react-native';

import { colors, fonts } from '@/constants/brand';

import { useAuth } from '@/features/auth';

/**
 * Shop route group — staff only (CLAUDE.md §2.1), laid out as bottom tabs:
 * Today · Bookings · Customers · Settings. `bookings` and `customers` are
 * folders with their own stacks for detail and sub-screens.
 *
 * Auth has already resolved before any screen renders (RootNavigator holds
 * the splash until then), so a missing staff role here means the visitor is
 * a customer or signed out — send them to sign-in.
 */
export default function ShopLayout() {
  const { isStaff } = useAuth();

  if (!isStaff) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.inkSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <House color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

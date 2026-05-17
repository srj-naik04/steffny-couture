import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/**
 * Expo push-notification registration (CLAUDE.md §6.1).
 *
 * Called once after a customer's first booking — never on app launch — so the
 * OS permission prompt lands at a moment the request makes sense. The token
 * is stored in `push_tokens`: under the signed-in user when there is one,
 * otherwise through the migration-009 guest function.
 *
 * Every step is best-effort: a simulator (or Expo Go, which no longer issues
 * push tokens) simply makes this a no-op rather than throwing.
 */
export async function registerForPushNotifications(): Promise<void> {
  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) {
      granted = (await Notifications.requestPermissionsAsync()).granted;
    }
    if (!granted) return;

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    if (!token) return;

    const platform = Platform.OS === 'android' ? 'android' : 'ios';
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      await supabase
        .from('push_tokens')
        .upsert(
          { user_id: data.user.id, token, platform },
          { onConflict: 'token' },
        );
    } else {
      await supabase.rpc('register_guest_push_token', {
        p_token: token,
        p_platform: platform,
      });
    }
  } catch {
    // Push is non-essential — a device/runtime without it must never throw.
  }
}

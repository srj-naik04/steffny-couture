import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { authStorage } from '@/lib/auth-storage';
import { env } from '@/lib/env';
import { type Database } from '@/types/database';

/**
 * Supabase client — Postgres, Auth, Storage, Realtime.
 *
 * Typed against the generated `Database` schema (`types/database.ts`).
 * Regenerate that file after any migration:
 *   npx supabase gen types typescript --linked > types/database.ts
 *
 * Sessions persist in the OS keychain via `authStorage` (Phase 2) so shop
 * staff stay signed in across app restarts. `detectSessionInUrl` stays off —
 * this is a native app; password-reset deep links are handled explicitly in
 * the reset screen.
 */
export const supabase = createClient<Database>(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);

/**
 * Token auto-refresh must only run while the app is foregrounded. Supabase
 * recommends pausing it on background so a timer doesn't fire mid-suspend and
 * leave the session in a bad state. Registered once at module load.
 */
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

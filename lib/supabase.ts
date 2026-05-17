import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

/**
 * Supabase client — Postgres, Auth, Storage, Realtime.
 *
 * Phase 0 keeps this minimal: anonymous reads only, no session persistence.
 * Phase 2 (Authentication) wires a real storage adapter so shop staff
 * sessions survive app restarts. Until then `persistSession` stays off.
 */
export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

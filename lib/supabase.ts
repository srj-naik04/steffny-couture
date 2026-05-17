import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import { type Database } from '@/types/database';

/**
 * Supabase client — Postgres, Auth, Storage, Realtime.
 *
 * Typed against the generated `Database` schema (`types/database.ts`).
 * Regenerate that file after any migration:
 *   npx supabase gen types typescript --linked > types/database.ts
 *
 * Session persistence stays off until Phase 2 (Authentication) wires a
 * storage adapter so shop staff sessions survive app restarts.
 */
export const supabase = createClient<Database>(
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

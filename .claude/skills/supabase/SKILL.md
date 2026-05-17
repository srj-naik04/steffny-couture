---
name: supabase
description: Use this skill whenever working with Supabase — client setup, queries, mutations, auth, storage uploads, realtime subscriptions, Edge Functions, or debugging Supabase errors. Fires for any file in `/lib/supabase.ts`, `/features/*/api/`, `/supabase/functions/`, or any code that imports from `@supabase/supabase-js`. Covers client patterns, error handling, type generation, and the Supabase-specific gotchas that bite at runtime.
---

# Supabase Client Conventions

## Client Setup

Single typed client in `/lib/supabase.ts`. Never create multiple instances.

```ts
import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';
import type { Database } from '@/types/database';
import { env } from '@/lib/env';

const storage = new MMKV();

const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: mmkvStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // RN only; true for web later
    },
  }
);
```

### Why MMKV not AsyncStorage
- ~10x faster reads
- Synchronous API (less boilerplate)
- Survives the Hermes/JSC distinction
- Smaller memory footprint

## Query Patterns

### Always co-locate query functions with the feature
```
/features/bookings/api/
  getBookings.ts
  getBookingById.ts
  createBooking.ts
  updateBookingStatus.ts
  cancelBooking.ts
```

### Standard query shape
```ts
// features/bookings/api/getBookings.ts
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Booking = Database['public']['Tables']['bookings']['Row'];

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, alteration_type:alteration_types(*)')
    .order('appointment_date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
```

Rules:
- **Always throw on error** — TanStack Query expects this. Don't return `{ data, error }`.
- **Always return `data ?? []`** for lists — never return `null`.
- **Always type the return** explicitly.
- **Use `.select(...)` with relationships** instead of multiple round-trips.

### Standard mutation shape
```ts
// features/bookings/api/createBooking.ts
import { supabase } from '@/lib/supabase';
import type { CreateBookingInput } from '../schemas';

export async function createBooking(input: CreateBookingInput) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

Always chain `.select().single()` on inserts when you need the row back.

## Type Generation

After every schema migration:
```bash
npx supabase gen types typescript --local > types/database.ts
```

Commit the generated file. The types it generates are the canonical source of truth for table shapes — derive everything from `Database['public']['Tables']['<table>']['Row']`.

## Auth Patterns

### `useAuth` hook
```ts
// features/auth/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setIsLoading(false);
      });
  }, [session?.user?.id]);

  return { session, profile, isLoading, signOut: () => supabase.auth.signOut() };
}
```

Wrap this in a Context provider at root if multiple components need it simultaneously to avoid duplicate fetches.

### Email + password sign-in
```ts
await supabase.auth.signInWithPassword({ email, password });
```

### Password reset
```ts
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'steffnycouture://reset-password',
});
```
The redirect URL uses the app scheme defined in `app.json`.

## Storage Upload Patterns

### Upload a photo from the booking wizard
```ts
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export async function uploadBookingPhoto(localUri: string, bookingId: string) {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const fileExt = localUri.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}.${fileExt}`;
  const path = `bookings/${bookingId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('booking-photos')
    .upload(path, decode(base64), {
      contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data.path;
}
```

### Get a signed URL for private photos
```ts
const { data, error } = await supabase.storage
  .from('booking-photos')
  .createSignedUrl(path, 60 * 60); // 1 hour
```

Public buckets use `.getPublicUrl(path)` instead.

## Realtime Subscriptions

Use sparingly — they hold an open WebSocket and add complexity. Only on screens where real-time updates are genuinely useful (customer booking detail watching for status changes; shop kanban).

```ts
useEffect(() => {
  const channel = supabase
    .channel(`booking:${bookingId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
      (payload) => {
        queryClient.setQueryData(['booking', bookingId], payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [bookingId]);
```

Pair with TanStack Query — use `setQueryData` to merge realtime updates into cache.

## Edge Functions

Live in `/supabase/functions/<name>/index.ts`. Deno runtime.

### Standard function template
```ts
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    // ... do work ...

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Calling from the app
```ts
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { type: 'booking_confirmation', booking_id: id },
});
```

### Secrets
Set via Supabase CLI:
```bash
supabase secrets set SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=... SMTP_PASS=...
```
Never commit secrets. Never read them in the mobile app.

## Common Gotchas

- **`.single()` throws if 0 rows** — use `.maybeSingle()` when zero is valid
- **`.eq('column', value)` with `null`** — use `.is('column', null)` instead
- **PostgREST returns nulls for missing relationships** — handle in TypeScript with `?.`
- **`select('*, foo:foreign_table(*)')`** renames the relationship; remember the alias when reading
- **RLS errors look like "row not found"** — not "permission denied". Check policies if a query returns empty unexpectedly.
- **`upsert` requires the conflict column to have a unique constraint** — otherwise it just inserts duplicates
- **Anonymous client + RLS** — anon key + RLS-enabled table = client can only do what `anon` policies allow. Forgetting an `anon` policy means anonymous booking inserts will silently fail.
- **JWT email is lowercased** — compare email matches with `lower(guest_email) = lower(auth.jwt() ->> 'email')` if mixed-case is possible
- **Timezone handling** — all timestamps are UTC in Postgres. Convert to `Europe/London` in the client only at render time via `/lib/date.ts`.

## Performance

- Index foreign keys and frequently-filtered columns (already done in master schema)
- Use `select` with specific columns when you don't need all fields: `.select('id, status, appointment_date')`
- Paginate lists beyond ~100 rows: `.range(0, 49)`
- Cache reference data (alteration_types, shop_settings) aggressively in TanStack Query (`staleTime: Infinity`)

## What goes in this skill vs `rls-policies`

- This skill: how to **use** Supabase from the app
- `rls-policies` skill: how to **secure** Supabase via policies

If you're writing SQL in a migration, switch to `rls-policies`. If you're calling `.from(...)` from TS, you're in this skill.

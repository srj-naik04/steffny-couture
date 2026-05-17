import { z } from 'zod';

/**
 * Typed, validated access to public environment variables.
 *
 * `EXPO_PUBLIC_*` vars are inlined into the JS bundle at build time. This
 * module parses them once at import and throws immediately if anything
 * required is missing or malformed — so a misconfigured build fails loudly
 * on boot rather than mysteriously at the first network call.
 */

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
});

const parsed = envSchema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `Missing or invalid environment variables.\n${issues}\n\n` +
      'Copy .env.example to .env.local and fill in your Supabase credentials.',
  );
}

export const env = parsed.data;

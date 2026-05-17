import { type AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';

import { type SignInValues } from '@/features/auth/schemas/auth-schemas';

/**
 * Authentication operations — thin, typed wrappers over `supabase.auth`.
 *
 * Each function throws a plain `Error` carrying brand-voice copy on failure,
 * so screens can `try/catch` and surface the message directly. Raw Supabase
 * `AuthError` text ("Invalid login credentials") never reaches the user.
 */

/** Map a Supabase auth failure to warm, brief, user-facing copy. */
function translateAuthError(error: AuthError): Error {
  // `code` is the stable signal; `message` is the human-readable fallback.
  switch (error.code) {
    case 'invalid_credentials':
      return new Error('Email or password is incorrect.');
    case 'email_not_confirmed':
      return new Error('Confirm your email address first, then sign in.');
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return new Error('Too many attempts. Wait a moment and try again.');
    case 'weak_password':
      return new Error('That password is too weak. Choose a longer one.');
    case 'same_password':
      return new Error('That is already your password. Choose a new one.');
    case 'user_not_found':
      return new Error('No account uses that email.');
    default:
      // Network failures arrive without a code.
      if (error.message.toLowerCase().includes('network')) {
        return new Error('Couldn’t reach the server. Check your connection.');
      }
      return new Error('Something went wrong. Try again.');
  }
}

/**
 * Deep link Supabase sends the password-recovery email back to. Must be added
 * to the project's allowed redirect URLs in the Supabase dashboard — see
 * docs/SETUP.md. Resolves to `steffnycouture://reset` in a standalone build
 * and an `exp://…/--/reset` URL inside Expo Go.
 */
export function getResetRedirectUrl(): string {
  return Linking.createURL('reset');
}

/** Parse an `a=1&b=2` fragment string into a flat, URL-decoded record. */
function parseFragment(fragment: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of fragment.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const raw = eq === -1 ? '' : pair.slice(eq + 1);
    out[decodeURIComponent(key)] = decodeURIComponent(raw.replace(/\+/g, ' '));
  }
  return out;
}

/**
 * Establish a session from a password-recovery deep link.
 *
 * The client runs with `detectSessionInUrl: false` (it's a native app), so
 * the recovery URL is parsed here by hand. Handles both the implicit flow
 * (tokens in the URL fragment) and the PKCE flow (an auth code in the query).
 *
 * Returns `'recovery'` once a session is established, `'none'` when the URL
 * carries no recovery payload, or throws friendly copy for an expired link.
 */
export async function completePasswordRecovery(
  url: string,
): Promise<'recovery' | 'none'> {
  const hashIndex = url.indexOf('#');
  const fragment =
    hashIndex === -1 ? {} : parseFragment(url.slice(hashIndex + 1));

  // An expired or already-used link returns an error payload, not tokens.
  if (fragment.error || fragment.error_code) {
    if (fragment.error_code === 'otp_expired') {
      throw new Error('This reset link has expired. Request a new one below.');
    }
    throw new Error('This reset link is no longer valid. Request a new one below.');
  }

  // Implicit flow — tokens travel in the URL fragment.
  if (fragment.type === 'recovery' && fragment.access_token && fragment.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: fragment.access_token,
      refresh_token: fragment.refresh_token,
    });
    if (error) throw translateAuthError(error);
    return 'recovery';
  }

  // PKCE flow — an auth code travels in the query string.
  const { queryParams } = Linking.parse(url);
  const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw translateAuthError(error);
    return 'recovery';
  }

  return 'none';
}

/** Sign a shop user in with email + password. */
export async function signIn(values: SignInValues): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword(values);
  if (error) throw translateAuthError(error);
}

/** Sign the current user out and clear the persisted session. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw translateAuthError(error);
}

/** Send a password-recovery email containing the deep link back into the app. */
export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getResetRedirectUrl(),
  });
  if (error) throw translateAuthError(error);
}

/**
 * Set a new password for the user in the active recovery session. The reset
 * screen must have established that session from the recovery deep link first.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw translateAuthError(error);
}

/**
 * Send a passwordless magic link that also creates an account if one doesn't
 * exist. The customer "save my details for next time" flow (Phase 3, booking
 * wizard) is the caller — exposed here as the auth primitive.
 */
export async function signUpWithMagicLink(params: {
  email: string;
  fullName?: string;
  phone?: string;
}): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email: params.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: Linking.createURL('/'),
      data: { full_name: params.fullName, phone: params.phone },
    },
  });
  if (error) throw translateAuthError(error);
}

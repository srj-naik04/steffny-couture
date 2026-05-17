import { type Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '@/lib/supabase';

import { isStaffRole, type Profile } from '@/features/auth/types';

/**
 * App-wide authentication state.
 *
 * `AuthProvider` subscribes once to `onAuthStateChange` and fetches the
 * matching `profiles` row whenever the signed-in user changes. Every screen
 * reads the result through `useAuth()` — there is exactly one subscription
 * and one profile fetch for the whole app.
 */

type AuthState = {
  /** The Supabase session, or `null` when signed out. */
  session: Session | null;
  /** The signed-in user's profile row, or `null` when signed out / customer guest. */
  profile: Profile | null;
  /** True until the initial session (and its profile, if any) has resolved. */
  isLoading: boolean;
  /** True when the signed-in user holds a staff role (tailor/manager/owner/admin). */
  isStaff: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Two independent gates — the session lookup and the profile fetch. The app
  // is "loading" until both that apply have settled.
  const [sessionResolved, setSessionResolved] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);

  // Track the session and react to sign-in / sign-out / token-refresh events.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionResolved(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionResolved(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Fetch (or clear) the profile whenever the signed-in user changes.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileResolved(true);
      return;
    }

    let active = true;
    setProfileResolved(false);
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setProfile(data);
        setProfileResolved(true);
      });

    // Ignore an in-flight fetch if the user changes again before it lands.
    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      profile,
      isLoading: !sessionResolved || !profileResolved,
      isStaff: isStaffRole(profile?.role),
    }),
    [session, profile, sessionResolved, profileResolved],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Read the app-wide auth state. Must be used within `<AuthProvider>`. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
}

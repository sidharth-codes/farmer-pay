import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthStatus, User, UserRole } from '../types';
import { auth, type RegisterInput } from '../services/auth';
import { supabase } from '../api/supabase';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export type { RegisterInput };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const loadUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }
    const profile = await auth.getCurrentUser();
    if (profile && !profile.isSuspended) {
      setUser(profile);
      setStatus('authenticated');
    } else {
      await supabase.auth.signOut();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStatus('unauthenticated');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        (async () => {
          await loadUser();
        })();
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { user: profile } = await auth.login(email, password);
    setUser(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<User> => {
    const profile = await auth.register(input);
    setUser(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await auth.getCurrentUser();
    if (profile) setUser(profile);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser, hasRole }),
    [user, status, login, register, logout, refreshUser, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

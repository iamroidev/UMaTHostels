import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export interface Profile {
  id: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  student_id?: string;
  university?: string;
  is_premium?: boolean;
  premium_expires_at?: string | null;
  avatar_url?: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initializing: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: any }>;
  signUpWithPassword: (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => Promise<{ error?: any }>;
  resendEmailVerification: (email: string) => Promise<{ error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const emailRedirectTo = process.env.EXPO_PUBLIC_EMAIL_REDIRECT_URL;

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.warn('Failed to fetch session', error);
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let active = true;
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!active) return;

        if (error) {
          console.warn('Failed to load profile', error);
        } else {
          setProfile((data as Profile) ?? null);
        }
      } catch (error) {
        console.warn('Profile fetch error', error);
      }
    };

    fetchProfile();
  }, [user]);

  const signInWithPassword: AuthContextValue['signInWithPassword'] = async (email, password) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithPassword: AuthContextValue['signUpWithPassword'] = async (email, password, metadata) => {
    setLoading(true);
    try {
      const profileMetadata: Record<string, any> | undefined = metadata
        ? {
            ...metadata,
            ...(metadata.fullName && { full_name: metadata.fullName }),
            ...(metadata.studentId && { student_id: metadata.studentId }),
            ...(metadata.phoneNumber && { phone_number: metadata.phoneNumber }),
          }
        : undefined;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileMetadata,
          emailRedirectTo: emailRedirectTo || undefined,
        },
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resendEmailVerification: AuthContextValue['resendEmailVerification'] = async (email) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut: AuthContextValue['signOut'] = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setProfile(null);
      }
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('Failed to refresh profile', error);
    } else {
      setProfile((data as Profile) ?? null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      initializing,
      signInWithPassword,
      signUpWithPassword,
      resendEmailVerification,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, loading, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

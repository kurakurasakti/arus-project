'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import {
    createSupabaseClient,
    getStoredCredentials,
    SupabaseCredentials
} from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initialized: boolean;
    signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    supabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient> | null>(null);
    const [supabaseConfigured, setSupabaseConfigured] = useState(false);

    // Initialize Supabase client and auth state
    useEffect(() => {
        const initSupabase = async () => {
            const credentials = getStoredCredentials();

            if (credentials?.supabaseUrl && credentials?.supabaseAnonKey) {
                const client = createSupabaseClient(
                    credentials.supabaseUrl,
                    credentials.supabaseAnonKey
                );
                setSupabase(client);
                setSupabaseConfigured(true);

                // Get initial session
                const { data: { session } } = await client.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);

                // Listen for auth changes
                const { data: { subscription } } = client.auth.onAuthStateChange(
                    (_event, session) => {
                        setSession(session);
                        setUser(session?.user ?? null);
                        setLoading(false);
                    }
                );

                setInitialized(true);
                setLoading(false);

                return () => {
                    subscription.unsubscribe();
                };
            } else {
                setSupabaseConfigured(false);
                setInitialized(true);
                setLoading(false);
            }
        };

        initSupabase();
    }, []);

    const signUp = async (email: string, password: string) => {
        if (!supabase) {
            toast.error('Supabase is not configured');
            return { error: { name: 'ConfigError', message: 'Supabase is not configured' } as AuthError };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            return { error };
        }

        if (data.user) {
            toast.success('Check your email for confirmation link');
        }

        return { error: null };
    };

    const signIn = async (email: string, password: string) => {
        if (!supabase) {
            toast.error('Supabase is not configured');
            return { error: { name: 'ConfigError', message: 'Supabase is not configured' } as AuthError };
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            return { error };
        }

        toast.success('Successfully signed in');
        return { error: null };
    };

    const signInWithGoogle = async () => {
        if (!supabase) {
            toast.error('Supabase is not configured');
            return { error: { name: 'ConfigError', message: 'Supabase is not configured' } as AuthError };
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            toast.error(error.message);
            return { error };
        }

        return { error: null };
    };

    const signOut = async () => {
        if (!supabase) return;

        const { error } = await supabase.auth.signOut();

        if (error) {
            toast.error(error.message);
            return;
        }

        setUser(null);
        setSession(null);
        toast.success('Successfully signed out');
    };

    const value: AuthContextType = {
        user,
        session,
        loading,
        initialized,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        supabaseConfigured,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

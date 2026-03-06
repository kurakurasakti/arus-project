import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for Supabase credentials
export interface SupabaseCredentials {
    supabaseUrl: string;
    supabaseAnonKey: string;
}

// Storage key for credentials use
const SUPABASE_CREDENTIALS_KEY: string = 'supabase_credentials';

// Get stored credentials from localStorage (client-side only)
export const getStoredCredentials = (): SupabaseCredentials | null => {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(SUPABASE_CREDENTIALS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    return null;
};

// Save credentials to localStorage (client-side only)
export const saveCredentials = (credentials: SupabaseCredentials): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SUPABASE_CREDENTIALS_KEY, JSON.stringify(credentials));
};

// Clear credentials from localStorage
export const clearCredentials = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SUPABASE_CREDENTIALS_KEY);
};

// Create Supabase client with provided credentials
export const createSupabaseClient = (
    supabaseUrl: string,
    supabaseAnonKey: string
): SupabaseClient => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });
};

// Create Supabase client from stored credentials
export const createSupabaseClientFromStored = (): SupabaseClient | null => {
    const credentials = getStoredCredentials();
    if (!credentials?.supabaseUrl || !credentials?.supabaseAnonKey) {
        return null;
    }
    return createSupabaseClient(credentials.supabaseUrl, credentials.supabaseAnonKey);
};

// Default export for Supabase client
// This will be initialized lazily with stored credentials
let supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (!supabase) {
        supabase = createSupabaseClientFromStored();
    }
    return supabase;
};

export const setSupabase = (client: SupabaseClient): void => {
    supabase = client;
};

// Re-export types from supabase-js for convenience
export type { User, Session, AuthError } from '@supabase/supabase-js';

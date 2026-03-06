// lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';

export const createClient = () => {
    return createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
};

// Optional: singleton for convenience (safe in client components)
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export const getSupabaseBrowserClient = () => {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
};
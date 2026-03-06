'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoredCredentials } from '@/lib/supabase';

export default function HomePage() {
    const router = useRouter();
    const credentials = getStoredCredentials();
    const isSupabaseConfigured = credentials?.supabaseUrl && credentials?.supabaseAnonKey;

    useEffect(() => {
        // If Supabase is not configured, redirect to config page
        if (!isSupabaseConfigured) {
            router.push('/supabase-config');
        }
    }, [isSupabaseConfigured, router]);

    // Show landing page if Supabase is configured
    if (!isSupabaseConfigured) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to Arus Project</CardTitle>
                    <CardDescription>
                        Authentication system with Supabase
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        Get started by signing in or creating an account
                    </p>
                    <div className="space-y-2">
                        <Link href="/login">
                            <Button className="w-full" variant="default">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="w-full" variant="outline">
                                Create Account
                            </Button>
                        </Link>
                    </div>
                    <div className="text-center">
                        <Link href="/supabase-config" className="text-sm text-muted-foreground hover:underline">
                            Reconfigure Supabase
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

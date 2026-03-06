'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveCredentials, getStoredCredentials } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function SupabaseConfigPage() {
    const router = useRouter();
    const { supabaseConfigured } = useAuth();
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load stored credentials
        const credentials = getStoredCredentials();
        if (credentials) {
            setSupabaseUrl(credentials.supabaseUrl);
            setSupabaseAnonKey(credentials.supabaseAnonKey);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate inputs
        if (!supabaseUrl.trim()) {
            toast.error('Supabase URL is required');
            setIsLoading(false);
            return;
        }

        if (!supabaseAnonKey.trim()) {
            toast.error('Supabase Anon Key is required');
            setIsLoading(false);
            return;
        }

        if (!supabaseUrl.startsWith('https://')) {
            toast.error('Supabase URL must start with https://');
            setIsLoading(false);
            return;
        }

        // Save credentials
        saveCredentials({
            supabaseUrl: supabaseUrl.trim(),
            supabaseAnonKey: supabaseAnonKey.trim(),
        });

        toast.success('Supabase credentials saved successfully');

        // Reload the page to reinitialize Supabase client
        window.location.href = '/login';
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Configure Supabase</CardTitle>
                    <CardDescription>
                        Enter your Supabase credentials to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="supabase-url">Supabase URL</Label>
                            <Input
                                id="supabase-url"
                                type="url"
                                placeholder="https://your-project.supabase.co"
                                value={supabaseUrl}
                                onChange={(e) => setSupabaseUrl(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Your Supabase project URL (e.g., https://xyz.supabase.co)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supabase-anon-key">Supabase Anon Key</Label>
                            <Input
                                id="supabase-anon-key"
                                type="password"
                                placeholder="Enter your anon key"
                                value={supabaseAnonKey}
                                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Find this in your Supabase dashboard: Settings → API → Project API keys
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Credentials'}
                        </Button>

                        {supabaseConfigured && (
                            <p className="text-sm text-green-600 text-center">
                                ✓ Supabase is configured
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

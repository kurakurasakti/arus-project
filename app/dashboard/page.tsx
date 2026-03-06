'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredCredentials } from '@/lib/supabase';

export default function DashboardPage() {
    const router = useRouter();
    const { user, signOut, loading: authLoading, initialized } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Check if Supabase is configured
    const credentials = getStoredCredentials();
    const isSupabaseConfigured = credentials?.supabaseUrl && credentials?.supabaseAnonKey;

    // Redirect to login if not authenticated
    useEffect(() => {
        if (initialized && !authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, initialized, router]);

    // Redirect to config if Supabase is not configured
    useEffect(() => {
        if (initialized && !isSupabaseConfigured) {
            router.push('/supabase-config');
        }
    }, [isSupabaseConfigured, initialized, router]);

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut();
        router.push('/login');
        setIsLoading(false);
    };

    // Show loading while checking auth
    if (authLoading || !initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!user) {
        return null;
    }

    // Get user initials for avatar
    const getUserInitials = () => {
        if (user.email) {
            const parts = user.email.split('@');
            return parts[0].slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <Button
                        variant="outline"
                        onClick={handleSignOut}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* User Info Card */}
                    <Card className="col-span-full md:col-span-2 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>
                                Your account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={user.user_metadata?.avatar_url} />
                                    <AvatarFallback className="text-lg">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-lg font-medium">
                                        {user.email}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        User ID: {user.id}
                                    </p>
                                    {user.created_at && (
                                        <p className="text-sm text-muted-foreground">
                                            Member since: {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/supabase-config')}
                            >
                                Configure Supabase
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleSignOut}
                                disabled={isLoading}
                            >
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>

                    {/* User Metadata Card */}
                    {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                        <Card className="col-span-full">
                            <CardHeader>
                                <CardTitle>Additional Info</CardTitle>
                                <CardDescription>
                                    Additional user metadata
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    {Object.entries(user.user_metadata).map(([key, value]) => (
                                        <div key={key} className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-muted-foreground">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}

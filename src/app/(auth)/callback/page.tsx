'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshAuth, setAuth } = useStore();
    const { toast } = useToast();

    useEffect(() => {
        const token = searchParams.get('token');
        const sessionToken = searchParams.get('sessionToken');

        if (token) {
            // First, manually set the token so upcoming API calls are authenticated
            // We use a temporary dummy user that will be overwritten by refreshAuth
            setAuth({ id: '', email: '', username: '', name: '' }, token, true);

            // Now refresh to get the real user data
            refreshAuth()
                .then(() => {
                    toast({
                        title: "Login Successful",
                        description: "Welcome to Yiddishtishel!",
                    });
                    router.push('/');
                })
                .catch((error) => {
                    console.error('OAuth callback error:', error);
                    toast({
                        variant: "destructive",
                        title: "Authentication Failed",
                        description: "Could not retrieve user profile.",
                    });
                    router.push('/login');
                });
        } else {
            router.push('/login');
        }
    }, [searchParams, setAuth, refreshAuth, router, toast]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold">Completing login...</h2>
            <p className="text-muted-foreground">Please wait while we set up your session.</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackHandler />
        </Suspense>
    );
}

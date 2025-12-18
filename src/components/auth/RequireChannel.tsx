'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

interface RequireChannelProps {
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * Wraps pages that require the user to have a channel.
 * Redirects to channel creation if no channel exists.
 */
export default function RequireChannel({
    children,
    redirectTo = '/channel/create'
}: RequireChannelProps) {
    const { user, isAuthenticated, isLoading } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!user?.channel) {
                router.push(redirectTo);
            }
        }
    }, [isAuthenticated, isLoading, user, router, redirectTo]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user?.channel) {
        return null;
    }

    return <>{children}</>;
}

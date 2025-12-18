'use client';

import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { refreshAuth, token } = useStore();

    useEffect(() => {
        if (token) {
            refreshAuth();
        }
    }, [refreshAuth, token]);

    return <>{children}</>;
}

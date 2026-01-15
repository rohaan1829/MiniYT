'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
    const { sidebarOpen } = useStore();

    return (
        <main
            className={cn(
                "pt-0 transition-[padding] duration-300 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-6rem)] pb-24 md:pb-8",
                className,
                sidebarOpen ? "md:pl-72" : "md:pl-0"
            )}
        >
            {children}
        </main>
    );
}

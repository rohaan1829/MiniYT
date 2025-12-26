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
                "pt-4 transition-[padding] duration-300",
                className,
                sidebarOpen ? "md:pl-72" : "md:pl-0"
            )}
        >
            {children}
        </main>
    );
}

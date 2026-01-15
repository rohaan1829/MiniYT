'use client';

import { Flame } from 'lucide-react';
import TrendingGrid from '@/components/video/TrendingGrid';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function TrendingPage() {
    const { sidebarOpen } = useStore();

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false // Force collapsed
        });
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground relative pb-32">
            <Header />
            <Sidebar />
            <main
                className={cn(
                    "px-4 md:px-8 pt-4 md:pt-8 max-w-[1920px] mx-auto space-y-4 md:space-y-6 transition-[padding] duration-300 pb-32",
                    sidebarOpen ? "md:pl-72" : "md:pl-8"
                )}
            >
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                    <div className="p-2 md:p-3 bg-primary/10 rounded-full">
                        <Flame className="w-5 h-5 md:w-8 md:h-8 text-primary fill-primary" />
                    </div>
                    <h1 className="text-xl md:text-3xl font-bold">Trending</h1>
                </div>

                <p className="text-sm md:text-lg text-muted-foreground mb-4 md:mb-8">Top videos trending on Yiddishtishel right now.</p>

                <TrendingGrid />
            </main>
            <FloatingDock />
        </div>
    );
}

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
                    "px-4 md:px-8 pt-8 max-w-[1920px] mx-auto space-y-6 transition-[padding] duration-300",
                    sidebarOpen ? "md:pl-72" : "md:pl-8"
                )}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Flame className="w-8 h-8 text-primary fill-primary" />
                    </div>
                    <h1 className="text-3xl font-bold">Trending</h1>
                </div>

                <p className="text-muted-foreground mb-8 text-lg">Top videos trending on MiniYT right now.</p>

                <TrendingGrid />
            </main>
            <FloatingDock />
        </div>
    );
}

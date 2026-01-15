'use client';

import { Compass } from 'lucide-react';
import VideoGrid from '@/components/video/VideoGrid';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function ExplorePage() {
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
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
                    <div className="p-2 md:p-3 bg-primary/10 rounded-full">
                        <Compass className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h1 className="text-xl md:text-3xl font-bold">Explore</h1>
                </div>

                <VideoGrid />
            </main>
            <FloatingDock />
        </div>
    );
}

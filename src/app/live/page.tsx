'use client';

import { Radio } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { VIDEOS } from '@/data/mockData';
import VideoCard from '@/components/video/VideoCard';

export default function LivePage() {
    const { sidebarOpen } = useStore();

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
    }, []);

    const liveVideos = VIDEOS.filter(v => v.isLive);

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
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-full">
                        <Radio className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold">Live</h1>
                </div>

                {liveVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {liveVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <Radio className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">No live streams right now.</p>
                    </div>
                )}
            </main>
            <FloatingDock />
        </div>
    );
}

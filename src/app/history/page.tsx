'use client';

import { History } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import VideoCard from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { historyApi } from '@/lib/api/history';
import { mapBackendVideoToFrontend } from '@/lib/video-mapper';
import { Video } from '@/data/mockData';

export default function HistoryPage() {
    const { sidebarOpen } = useStore();
    const [mounted, setMounted] = useState(false);
    const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
        setMounted(true);
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await historyApi.getWatchHistory();
            if (response.success) {
                const mapped = response.data.map((item: any) => mapBackendVideoToFrontend(item.video));
                setHistoryVideos(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to clear your watch history?')) return;
        try {
            await historyApi.clearWatchHistory();
            setHistoryVideos([]);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    };

    if (!mounted) return null;

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <History className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">Watch History</h1>
                    </div>
                    {historyVideos.length > 0 && (
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            onClick={handleClearHistory}
                        >
                            Clear watch history
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-video bg-muted animate-pulse rounded-xl" />
                                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : historyVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {historyVideos.map((video, index) => (
                            <VideoCard key={`${video.id}-${index}`} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">You haven't watched any videos yet.</p>
                        <Button variant="link" asChild className="mt-4">
                            <a href="/">Go Home</a>
                        </Button>
                    </div>
                )}
            </main>
            <FloatingDock />
        </div>
    );
}

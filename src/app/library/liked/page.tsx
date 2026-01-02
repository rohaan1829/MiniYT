'use client';

import { ThumbsUp, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { likesApi } from '@/lib/api/interactions';
import VideoCard, { VideoCardSkeleton } from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function LikedVideosPage() {
    const { sidebarOpen } = useStore();
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        useStore.setState({ sidebarOpen: true });
        fetchLikedVideos();
    }, []);

    const fetchLikedVideos = async () => {
        setIsLoading(true);
        try {
            const response = await likesApi.getLikedVideos();
            if (response.success) {
                setVideos(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch liked videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />
                <PageContainer>
                    <div className="max-w-[1920px] mx-auto space-y-8 px-4 py-8">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="rounded-full hover:bg-secondary"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <ThumbsUp className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Liked videos</h1>
                                    <p className="text-muted-foreground text-sm">
                                        {videos.length} video{videos.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Video Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8 mt-6">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <VideoCardSkeleton key={i} />
                                ))
                            ) : videos.length > 0 ? (
                                videos.map((video) => (
                                    <VideoCard key={video.id} video={video} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center space-y-4">
                                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ThumbsUp className="w-10 h-10 text-muted-foreground opacity-20" />
                                    </div>
                                    <h3 className="text-xl font-semibold">No liked videos yet</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        Videos you like will appear here. Start exploring and show some love!
                                    </p>
                                    <Button onClick={() => router.push('/')} variant="default" className="mt-4">
                                        Explore Videos
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </PageContainer>
            </div>
        </ProtectedRoute>
    );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Video,
    ArrowLeft,
    Loader2,
    Plus,
    Eye,
    MessageCircle,
    MoreVertical,
    Play,
    Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatViews, formatTimeAgo } from '@/lib/formatters';
import { analyticsApi, ChannelVideo } from '@/lib/api/analytics';
import Link from 'next/link';

export default function VideosPage() {
    const { user, sidebarOpen } = useStore();
    const router = useRouter();
    const [videos, setVideos] = useState<ChannelVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        useStore.setState({ sidebarOpen: true });
    }, []);

    const fetchVideos = useCallback(async () => {
        if (!user?.channel?.id) return;

        setLoading(true);
        try {
            const response = await analyticsApi.getChannelVideos(user.channel.id, 50, 0);
            if (response.success) {
                setVideos(response.data.videos);
            }
        } catch (err) {
            console.error('Failed to fetch videos:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.channel?.id]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    if (!user?.channel) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="bg-card/40 border-border/50 max-w-md">
                        <CardContent className="py-12 text-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Video className="w-10 h-10 text-primary/40" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">No Channel Found</h1>
                            <p className="text-muted-foreground mb-6">You need a channel to view your videos.</p>
                            <Button onClick={() => router.push('/channel/create')}>Create Channel</Button>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer>
                    <div className="max-w-6xl mx-auto space-y-8 px-4 py-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.back()}
                                    className="rounded-full hover:bg-secondary"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Video className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Creator Studio</span>
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tight">Your Videos</h1>
                                    <p className="text-muted-foreground mt-1">
                                        {videos.length} video{videos.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <Button onClick={() => router.push('/upload')} size="lg" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Upload New Video
                            </Button>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : videos.length === 0 ? (
                            <Card className="bg-card/40 border-dashed border-2 border-border/50">
                                <CardContent className="py-20 text-center">
                                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Video className="w-10 h-10 text-primary/40" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                        Start sharing your content with the community.
                                    </p>
                                    <Button onClick={() => router.push('/upload')} className="gap-2">
                                        <Upload className="w-4 h-4" />
                                        Upload your first video
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {videos.map((video) => (
                                    <Card
                                        key={video.id}
                                        className="bg-card/40 border-border/50 hover:border-primary/30 transition-all group"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                {/* Thumbnail */}
                                                <Link href={`/watch/${video.id}`} className="flex-shrink-0">
                                                    <div className="w-40 h-24 rounded-xl overflow-hidden relative bg-secondary group-hover:ring-2 ring-primary/30 transition-all">
                                                        {video.thumbnailUrl ? (
                                                            <img
                                                                src={video.thumbnailUrl}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Video className="w-8 h-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        {/* Play overlay */}
                                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                                                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/watch/${video.id}`}>
                                                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                                                            {video.title}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full font-bold uppercase text-[10px]",
                                                            video.status === 'ready' ? "bg-green-500/10 text-green-500" :
                                                                video.status === 'processing' ? "bg-yellow-500/10 text-yellow-500" :
                                                                    video.status === 'failed' ? "bg-red-500/10 text-red-500" :
                                                                        "bg-secondary text-muted-foreground"
                                                        )}>
                                                            {video.status}
                                                        </span>
                                                        <span>{formatTimeAgo(video.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="hidden md:flex items-center gap-8 text-right">
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Eye className="w-4 h-4" />
                                                            <span className="text-sm font-bold text-foreground">{formatViews(video.views)}</span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Views</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <MessageCircle className="w-4 h-4" />
                                                            <span className="text-sm font-bold text-foreground">{video.comments}</span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Comments</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <Button variant="ghost" size="icon" className="rounded-full">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </PageContainer>
            </div>
        </ProtectedRoute>
    );
}

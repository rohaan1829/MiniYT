'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Play, ThumbsUp, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatViews, formatDuration } from '@/lib/formatters';

interface FeedVideoCardProps {
    video: {
        id: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        videoUrl?: string;
        views: number;
        duration?: number;
        likeCount?: number;
        createdAt: string;
        user: {
            id: string;
            name?: string;
            channel?: {
                id: string;
                handle: string;
                name: string;
                avatarUrl?: string;
            } | null;
        };
    };
}

export default function FeedVideoCard({ video }: FeedVideoCardProps) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const channelName = video.user?.channel?.name || video.user?.name || 'Unknown';
    const channelHandle = video.user?.channel?.handle;

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-5 md:p-6">
                {/* Header - Badge */}
                <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30">
                        New Video
                    </span>
                </div>

                {/* Video Thumbnail with Play Overlay */}
                <Link href={`/watch/${video.id}`} className="block mb-4">
                    <div className="relative rounded-xl overflow-hidden bg-black/30 aspect-video group cursor-pointer">
                        {video.thumbnailUrl ? (
                            <img
                                src={video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `${backendUrl}${video.thumbnailUrl}`}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                                <Play className="h-12 w-12 text-muted-foreground" />
                            </div>
                        )}

                        {/* Duration badge */}
                        {video.duration && video.duration > 0 && (
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
                                {formatDuration(video.duration)}
                            </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 transition-all group-hover:bg-black/40">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="h-7 w-7 text-black fill-black ml-1" />
                            </div>
                            <span className="text-white font-semibold text-lg drop-shadow-lg">
                                Watch on MiniYT
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Video Title */}
                <Link href={`/watch/${video.id}`}>
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {video.title}
                    </h3>
                </Link>

                {/* Channel Name */}
                {channelHandle && (
                    <Link href={`/channel/${channelHandle}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {channelName}
                    </Link>
                )}

                {/* Footer - Timestamp and Stats */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(video.createdAt))} ago
                    </span>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            {formatViews(video.views)}
                        </span>
                        {video.likeCount !== undefined && video.likeCount > 0 && (
                            <span className="flex items-center gap-1.5">
                                <ThumbsUp className="h-4 w-4" />
                                {formatViews(video.likeCount)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Eye, ThumbsUp, Clock, Share2, Bookmark } from 'lucide-react';
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
    const channelAvatar = video.user?.channel?.avatarUrl;

    // Helper to get proper media URL (handles both S3 URLs and local paths)
    const getMediaUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${backendUrl}${url}`;
    };

    return (
        <div className="bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 hover:border-white/20">
            {/* Decorative top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />

            <div className="p-6 md:p-8">
                {/* Header - Creator info and badge */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <Link href={channelHandle ? `/channel/${channelHandle}` : '#'}>
                            <Avatar className="h-12 w-12 ring-2 ring-white/10 hover:ring-blue-500/50 transition-all">
                                <AvatarImage src={getMediaUrl(channelAvatar)} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
                                    {channelName[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>

                        <div>
                            <Link href={channelHandle ? `/channel/${channelHandle}` : '#'} className="font-bold text-foreground hover:text-primary transition-colors">
                                {channelName}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {formatDistanceToNow(new Date(video.createdAt))} ago
                            </p>
                        </div>
                    </div>
                </div>

                {/* Video Thumbnail with Play Overlay */}
                <Link href={`/watch/${video.id}`} className="block mb-5">
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-black/50 aspect-video group cursor-pointer ring-1 ring-white/10">
                        {video.thumbnailUrl ? (
                            <img
                                src={getMediaUrl(video.thumbnailUrl)}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-cyan-900/50 flex items-center justify-center">
                                <Play className="h-16 w-16 text-white/30" />
                            </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Duration badge */}
                        {video.duration && video.duration > 0 && (
                            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/90 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                                <Clock className="h-3 w-3" />
                                {formatDuration(video.duration)}
                            </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center transition-all">
                            <div className="w-18 h-18 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/20 p-5">
                                <Play className="h-10 w-10 text-black fill-black ml-1" />
                            </div>
                        </div>

                        {/* Bottom info bar */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-blue-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                                Watch Now
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Video Title */}
                <Link href={`/watch/${video.id}`}>
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 hover:text-primary transition-colors">
                        {video.title}
                    </h3>
                </Link>

                {/* Video Description if available */}
                {video.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {video.description}
                    </p>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center justify-between pt-5 border-t border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium text-sm">{formatViews(video.views)} views</span>
                        </div>
                        {video.likeCount !== undefined && video.likeCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-muted-foreground">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="font-medium text-sm">{formatViews(video.likeCount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
                            <Share2 className="h-4 w-4" />
                        </button>
                        <button className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
                            <Bookmark className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

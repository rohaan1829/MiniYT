'use client';

import { Play, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatViews, formatDuration } from '@/lib/formatters';

interface TrendingVideo {
    id: string;
    title: string;
    thumbnailUrl?: string;
    views: number;
    duration?: number;
    channelName: string;
    channelHandle: string;
}

// Mock data - in production, fetch from trending API
const mockTrendingVideos: TrendingVideo[] = [
    { id: '1', title: 'Amazing Tech Review 2026', thumbnailUrl: '', views: 125000, duration: 612, channelName: 'Tech Reviews', channelHandle: 'techreviews' },
    { id: '2', title: 'Epic Gaming Moments Compilation', thumbnailUrl: '', views: 89000, duration: 1845, channelName: 'Gaming Pro', channelHandle: 'gamingpro' },
    { id: '3', title: 'Learn Music Production in 30 Days', thumbnailUrl: '', views: 56000, duration: 2150, channelName: 'Music Academy', channelHandle: 'musicacademy' },
];

export default function TrendingVideosWidget() {
    const [videos, setVideos] = useState<TrendingVideo[]>(mockTrendingVideos);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    return (
        <div className="bg-white/5 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <h2 className="text-xl font-bold">Trending Videos</h2>
            </div>

            {/* Videos List */}
            <div>
                {videos.map((video) => (
                    <Link
                        key={video.id}
                        href={`/watch/${video.id}`}
                        className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                    >
                        {/* Thumbnail */}
                        <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0">
                            {video.thumbnailUrl ? (
                                <img
                                    src={video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `${backendUrl}${video.thumbnailUrl}`}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                    <Play className="h-5 w-5 text-white/50" />
                                </div>
                            )}
                            {video.duration && (
                                <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">
                                    {formatDuration(video.duration)}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{video.channelName}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Eye className="h-3 w-3" />
                                <span>{formatViews(video.views)}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Show More */}
            <Link
                href="/trending"
                className="block px-4 py-3 text-primary hover:bg-white/5 transition-colors text-sm"
            >
                Show more
            </Link>
        </div>
    );
}

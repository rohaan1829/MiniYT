'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Eye, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { VideoData } from '@/lib/api/videos';
import { Post, postsApi } from '@/lib/api/posts';
import { formatViews, formatDuration } from '@/lib/formatters';

interface ChannelContentGridProps {
    channelId: string;
    type: 'posts' | 'videos';
    videos?: VideoData[];
    isLoading?: boolean;
    isOwner: boolean;
}

export default function ChannelContentGrid({
    channelId,
    type,
    videos = [],
    isLoading = false,
    isOwner
}: ChannelContentGridProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    useEffect(() => {
        if (type === 'posts') {
            fetchPosts();
        }
    }, [channelId, type]);

    const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
            const response = await postsApi.getChannelPosts(channelId);
            if (response.success) {
                setPosts(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch posts:', err);
        } finally {
            setLoadingPosts(false);
        }
    };

    // Grid items for posts (filter to only posts with media for the grid display)
    const postsWithMedia = posts.filter(p => p.mediaUrl);

    if (type === 'videos') {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        if (videos.length === 0) {
            return (
                <div className="text-center py-20 text-muted-foreground">
                    <Play className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No videos yet</p>
                    {isOwner && <p className="text-sm mt-1">Upload your first video!</p>}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {videos.map((video) => (
                    <Link key={video.id} href={`/watch/${video.id}`}>
                        <div className="group relative aspect-[9/10] bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                            {/* Thumbnail Container */}
                            <div className="aspect-square relative overflow-hidden">
                                <img
                                    src={video.thumbnailUrl ? (video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `${backendUrl}${video.thumbnailUrl}`) : '/placeholder-video.jpg'}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                                        <Play className="h-7 w-7 text-black fill-black ml-1" />
                                    </div>
                                </div>
                                {/* Duration badge */}
                                {video.duration && video.duration > 0 && (
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-[10px] font-black rounded-md backdrop-blur-md">
                                        {formatDuration(video.duration)}
                                    </div>
                                )}
                            </div>

                            {/* Content Info */}
                            <div className="p-5">
                                <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-3">
                                    {video.title}
                                </h3>
                                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-md">
                                        <Eye className="h-3 w-3" />
                                        {formatViews(video.views)}
                                    </span>
                                    {video.createdAt && (
                                        <span className="px-2 py-1 bg-secondary/50 rounded-md">
                                            {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    }

    // Posts type
    if (loadingPosts) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No posts yet</p>
                {isOwner && <p className="text-sm mt-1">Share your first post with your community!</p>}
            </div>
        );
    }

    // If we have posts with media, show them in a grid
    if (postsWithMedia.length > 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {postsWithMedia.map((post) => (
                    <div key={post.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary cursor-pointer">
                        {post.type === 'IMAGE' && post.mediaUrl && (
                            <img
                                src={`${backendUrl}${post.mediaUrl}`}
                                alt="Post"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        )}
                        {post.type === 'VIDEO' && (
                            <Link href={`/watch/${post.id}`}>
                                <img
                                    src={post.thumbnailUrl ? `${backendUrl}${post.thumbnailUrl}` : '/placeholder-video.jpg'}
                                    alt="Video post"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                                        <Play className="h-6 w-6 text-black fill-black ml-1" />
                                    </div>
                                </div>
                            </Link>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        );
    }

    // If we have text-only posts, show them in a list format
    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="bg-white dark:bg-card rounded-2xl p-4 border border-gray-200 dark:border-border shadow-sm"
                >
                    <p className="text-foreground">{post.content}</p>
                </div>
            ))}
        </div>
    );
}

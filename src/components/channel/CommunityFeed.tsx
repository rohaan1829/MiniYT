'use client';

import { useState, useEffect } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import { videoApi, VideoData } from '@/lib/api/videos';
import { ThumbsUp, MessageSquare, Play, Loader2, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CommunityFeedProps {
    channelId: string;
    isOwner: boolean;
}

// Post type badge configuration
const POST_TYPE_CONFIG = {
    TEXT: {
        label: 'Announcement',
        className: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    },
    VIDEO: {
        label: 'New Video',
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    },
    IMAGE: {
        label: 'Update',
        className: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    },
};

interface FeedItem {
    id: string;
    createdAt: string;
    feedType: 'post' | 'video';
    type?: 'TEXT' | 'IMAGE' | 'VIDEO';
    content?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    likes?: number;
    title?: string;
    description?: string;
    views?: number;
    duration?: number;
    user?: any;
    _count?: { comments: number; likedBy: number };
}

export default function CommunityFeed({ channelId, isOwner }: CommunityFeedProps) {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    useEffect(() => {
        fetchFeed();
    }, [channelId]);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            // Fetch posts
            const postsResponse = await postsApi.getChannelPosts(channelId);
            const posts = postsResponse.success ? postsResponse.data : [];

            // Fetch videos
            const videosResponse = await videoApi.getVideos({ channelId });
            const videos = videosResponse.data || [];

            // Merge and sort
            const feed: FeedItem[] = [
                ...posts.map((p: Post) => ({ ...p, feedType: 'post' as const })),
                ...videos.map((v: VideoData) => ({
                    ...v,
                    feedType: 'video' as const,
                    type: 'VIDEO' as const,
                    content: v.description,
                })),
            ];

            feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setFeedItems(feed);
        } catch (err) {
            console.error('Failed to fetch feed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (feedItems.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No posts yet</p>
                {isOwner && <p className="text-sm mt-1">Share your first update with your community!</p>}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {feedItems.map((item) => (
                <CommunityPostCard key={item.id} item={item} backendUrl={backendUrl} />
            ))}
        </div>
    );
}

interface CommunityPostCardProps {
    item: FeedItem;
    backendUrl: string;
}

function CommunityPostCard({ item, backendUrl }: CommunityPostCardProps) {
    const [liked, setLiked] = useState(false);
    const typeConfig = POST_TYPE_CONFIG[item.type || 'TEXT'];

    const isVideo = item.feedType === 'video' || item.type === 'VIDEO';
    const hasMedia = item.mediaUrl || item.thumbnailUrl;
    const title = item.title || '';
    const content = item.content || '';
    const timestamp = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
                {/* Badge */}
                <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-bold mb-4",
                    typeConfig.className
                )}>
                    {typeConfig.label}
                </span>

                {/* Content Text */}
                {(title || content) && (
                    <p className="text-foreground mb-4 leading-relaxed">
                        {title || content}
                    </p>
                )}

                {/* Media - Video with overlay */}
                {isVideo && hasMedia && (
                    <Link href={`/watch/${item.id}`} className="block mb-4">
                        <div className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer">
                            <img
                                src={
                                    item.thumbnailUrl
                                        ? (item.thumbnailUrl.startsWith('http') ? item.thumbnailUrl : `${backendUrl}${item.thumbnailUrl}`)
                                        : '/placeholder-video.jpg'
                                }
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                            {/* Play button and text */}
                            <div className="absolute inset-0 flex items-center justify-center gap-3">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                                    </div>
                                    <span className="text-white font-semibold">Watch On MiniYT</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Image only */}
                {!isVideo && item.type === 'IMAGE' && item.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-4">
                        <img
                            src={`${backendUrl}${item.mediaUrl}`}
                            alt="Post"
                            className="w-full h-auto max-h-[400px] object-cover"
                        />
                    </div>
                )}

                {/* Timestamp and Actions */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Posted {timestamp.replace('about ', '').replace(' ago', ' ago')}
                    </span>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLiked(!liked)}
                            className={cn(
                                "flex items-center gap-1.5 font-medium transition-colors",
                                liked ? "text-primary" : "text-primary/70 hover:text-primary"
                            )}
                        >
                            <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
                            Like
                        </button>
                        <button className="flex items-center gap-1.5 text-primary/70 hover:text-primary font-medium transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="p-6 md:p-8">
                {/* Header with Badge and Timestamp */}
                <div className="flex items-center justify-between mb-6">
                    <span className={cn(
                        "inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                        typeConfig.className
                    )}>
                        {typeConfig.label}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {timestamp.replace('about ', '')}
                    </span>
                </div>

                {/* Content Text */}
                {(title || content) && (
                    <div className="mb-6">
                        {title && <h3 className="text-xl font-bold mb-2 leading-tight">{title}</h3>}
                        <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                            {content}
                        </p>
                    </div>
                )}

                {/* Media - Video with overlay */}
                {isVideo && hasMedia && (
                    <Link href={`/watch/${item.id}`} className="block mb-6">
                        <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer shadow-lg">
                            <img
                                src={
                                    item.thumbnailUrl
                                        ? (item.thumbnailUrl.startsWith('http') ? item.thumbnailUrl : `${backendUrl}${item.thumbnailUrl}`)
                                        : '/placeholder-video.jpg'
                                }
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Play button and text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 transform group-hover:scale-105 transition-transform">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl">
                                        <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                                    </div>
                                    <span className="text-white font-black text-sm uppercase tracking-wider">Watch Now</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Image only */}
                {!isVideo && item.type === 'IMAGE' && item.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden mb-6 shadow-md border border-border/30">
                        <img
                            src={`${backendUrl}${item.mediaUrl}`}
                            alt="Post"
                            className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-border/40">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLiked(!liked)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all active:scale-95",
                                liked
                                    ? "bg-primary/10 text-primary shadow-inner"
                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
                            {liked ? "Liked" : "Like"}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground font-bold text-sm transition-all active:scale-95">
                            <MessageSquare className="h-4 w-4" />
                            Comment
                        </button>
                    </div>

                    <button className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
                        <span className="sr-only">More Options</span>
                        <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

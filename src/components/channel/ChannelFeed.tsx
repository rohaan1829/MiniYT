'use client';

import { useState, useEffect } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import { VideoData } from '@/lib/api/videos';
import { ThumbsUp, MessageSquare, Play, Loader2, FileText, Eye, Clock, Image as ImageIcon, Type, Video as VideoIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatViews, formatDuration } from '@/lib/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/store/useStore';

interface ChannelFeedProps {
    channelId: string;
    videos: VideoData[];
    channel: {
        id: string;
        name: string;
        handle: string;
        avatarUrl?: string;
    };
    isOwner: boolean;
}

// Content type badge configuration
const CONTENT_TYPE_CONFIG = {
    TEXT: {
        label: 'Announcement',
        icon: Type,
        gradient: 'from-pink-500 to-rose-500',
        bgLight: 'bg-pink-500/10',
        textColor: 'text-pink-500',
    },
    IMAGE: {
        label: 'Photo',
        icon: ImageIcon,
        gradient: 'from-orange-500 to-amber-500',
        bgLight: 'bg-orange-500/10',
        textColor: 'text-orange-500',
    },
    VIDEO: {
        label: 'Video',
        icon: VideoIcon,
        gradient: 'from-blue-500 to-cyan-500',
        bgLight: 'bg-blue-500/10',
        textColor: 'text-blue-500',
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
    videoUrl?: string;
    user?: any;
    _count?: { comments: number; likedBy: number };
}

export default function ChannelFeed({ channelId, videos, channel, isOwner }: ChannelFeedProps) {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useStore();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    // Helper to get proper media URL (handles both S3 URLs and local paths)
    const getMediaUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${backendUrl}${url}`;
    };

    useEffect(() => {
        fetchFeed();
    }, [channelId, videos]);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            // Fetch posts
            const postsResponse = await postsApi.getChannelPosts(channelId);
            const posts = postsResponse.success ? postsResponse.data : [];

            // Merge videos and posts
            const feed: FeedItem[] = [
                ...posts.map((p: Post) => ({ ...p, feedType: 'post' as const })),
                ...videos.map((v: VideoData) => ({
                    ...v,
                    feedType: 'video' as const,
                    type: 'VIDEO' as const,
                    content: v.description,
                })),
            ];

            // Sort by newest first
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
            <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-3xl border border-dashed border-white/10">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-2xl font-bold mb-2">No content yet</p>
                {isOwner ? (
                    <p className="text-sm max-w-md mx-auto">
                        Start sharing content with your community! Upload videos or create posts to engage with your subscribers.
                    </p>
                ) : (
                    <p className="text-sm max-w-md mx-auto">
                        This channel hasn't posted any content yet. Check back later!
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {feedItems.map((item) => (
                <FeedCard
                    key={`${item.feedType}-${item.id}`}
                    item={item}
                    channel={channel}
                    getMediaUrl={getMediaUrl}
                />
            ))}
        </div>
    );
}

interface FeedCardProps {
    item: FeedItem;
    channel: {
        name: string;
        handle: string;
        avatarUrl?: string;
    };
    getMediaUrl: (url: string | undefined) => string | undefined;
}

function FeedCard({ item, channel, getMediaUrl }: FeedCardProps) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(item.likes || 0);
    const { user } = useStore();

    const typeConfig = CONTENT_TYPE_CONFIG[item.type || 'TEXT'];
    const TypeIcon = typeConfig.icon;
    const isVideoContent = item.feedType === 'video';
    const isPostVideo = item.feedType === 'post' && item.type === 'VIDEO';
    const hasMedia = item.mediaUrl || item.thumbnailUrl;
    const title = item.title || '';
    const content = item.content || '';
    const timestamp = formatDistanceToNow(new Date(item.createdAt), { addSuffix: false });

    const handleLike = async () => {
        if (!user) return;

        if (item.feedType === 'post') {
            try {
                const response = await postsApi.toggleLike(item.id);
                if (response.success) {
                    setLiked(response.data.liked);
                    setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
                }
            } catch (err) {
                console.error('Like error:', err);
            }
        }
    };

    return (
        <div className="bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300">
            {/* Decorative top gradient bar */}
            <div className={cn("h-1 w-full bg-gradient-to-r", typeConfig.gradient)} />

            <div className="p-6 md:p-8">
                {/* Header - Channel info and badge */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                        <Link href={`/channel/${channel.handle}`}>
                            <Avatar className="h-12 w-12 ring-2 ring-white/10 hover:ring-primary/50 transition-all">
                                <AvatarImage src={getMediaUrl(channel.avatarUrl)} />
                                <AvatarFallback className={cn("font-bold text-white bg-gradient-to-br", typeConfig.gradient)}>
                                    {channel.name[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>

                        <div>
                            <div className="flex items-center gap-3">
                                <Link href={`/channel/${channel.handle}`} className="font-bold text-foreground hover:text-primary transition-colors">
                                    {channel.name}
                                </Link>
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                    typeConfig.bgLight, typeConfig.textColor
                                )}>
                                    <TypeIcon className="w-3 h-3" />
                                    {typeConfig.label}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {timestamp} ago
                            </p>
                        </div>
                    </div>
                </div>

                {/* Title for videos */}
                {title && (
                    <Link href={isVideoContent ? `/watch/${item.id}` : '#'}>
                        <h3 className="text-xl font-bold mb-3 leading-tight hover:text-primary transition-colors">
                            {title}
                        </h3>
                    </Link>
                )}

                {/* Content text */}
                {content && (
                    <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed text-[15px] mb-5 line-clamp-4">
                        {content}
                    </p>
                )}

                {/* Media - Full video (from video uploads with HLS) */}
                {isVideoContent && hasMedia && (
                    <Link href={`/watch/${item.id}`} className="block mb-5">
                        <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer ring-1 ring-white/10">
                            <img
                                src={getMediaUrl(item.thumbnailUrl) || '/placeholder-video.jpg'}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Duration badge */}
                            {item.duration && item.duration > 0 && (
                                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/90 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(item.duration)}
                                </div>
                            )}

                            {/* Play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/20">
                                    <Play className="h-8 w-8 text-black fill-black ml-1" />
                                </div>
                            </div>

                            {/* Views badge */}
                            {item.views !== undefined && (
                                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 text-white text-xs font-bold rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                                    <Eye className="h-3 w-3" />
                                    {formatViews(item.views)} views
                                </div>
                            )}
                        </div>
                    </Link>
                )}

                {/* Post video (short clips) */}
                {isPostVideo && item.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden mb-5 ring-1 ring-white/10">
                        <video
                            src={getMediaUrl(item.mediaUrl)}
                            className="w-full max-h-[500px] object-contain bg-black"
                            controls
                            preload="metadata"
                        />
                    </div>
                )}

                {/* Image */}
                {item.type === 'IMAGE' && item.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden mb-5 ring-1 ring-white/10 bg-gradient-to-br from-secondary/50 to-secondary/30">
                        <img
                            src={getMediaUrl(item.mediaUrl)}
                            alt="Post"
                            className="w-full h-auto max-h-[500px] object-cover"
                        />
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-5 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all",
                                liked
                                    ? "bg-pink-500/20 text-pink-400"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                            )}
                        >
                            <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
                            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground font-medium text-sm transition-all">
                            <MessageSquare className="h-4 w-4" />
                            <span>
                                {item._count?.comments ? item._count.comments : 'Comment'}
                            </span>
                        </button>
                    </div>

                    {isVideoContent && (
                        <Link
                            href={`/watch/${item.id}`}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-sm transition-all"
                        >
                            <Play className="h-4 w-4" />
                            Watch
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

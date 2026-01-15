'use client';

import { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, ThumbsUp, MessageSquare, Play, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { postsApi, Post } from '@/lib/api/posts';
import Link from 'next/link';

interface ChannelCommunityProps {
    channelId: string;
    channelName: string;
    channelHandle: string;
    channelAvatar?: string;
}

// Post type badge configuration
const POST_TYPE_CONFIG = {
    TEXT: {
        label: 'Update',
        className: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
        icon: FileText,
    },
    VIDEO: {
        label: 'Video',
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        icon: Play,
    },
    IMAGE: {
        label: 'Photo',
        className: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
        icon: Sparkles,
    },
};

export default function ChannelCommunitySection({
    channelId,
    channelName,
    channelHandle,
    channelAvatar
}: ChannelCommunityProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    const fetchPosts = useCallback(async () => {
        if (!channelId) return;

        setLoading(true);
        try {
            const response = await postsApi.getChannelPosts(channelId, { limit: 3 });
            if (response.success) {
                setPosts(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch channel posts:', err);
        } finally {
            setLoading(false);
        }
    }, [channelId]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (posts.length === 0) {
        return null; // Don't show section if no posts
    }

    return (
        <div className="mt-8 space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Community</h3>
                        <p className="text-xs text-muted-foreground">Latest from {channelName}</p>
                    </div>
                </div>
                <Link href={`/channel/${channelHandle}`}>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary">
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <CommunityPostMiniCard key={post.id} post={post} backendUrl={backendUrl} />
                ))}
            </div>
        </div>
    );
}

interface CommunityPostMiniCardProps {
    post: Post;
    backendUrl: string;
}

function CommunityPostMiniCard({ post, backendUrl }: CommunityPostMiniCardProps) {
    const typeConfig = POST_TYPE_CONFIG[post.type || 'TEXT'];
    const timestamp = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    const IconComponent = typeConfig.icon;

    return (
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <CardContent className="p-4">
                {/* Badge */}
                <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                        typeConfig.className
                    )}>
                        <IconComponent size={10} />
                        {typeConfig.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {timestamp.replace('about ', '')}
                    </span>
                </div>

                {/* Content Preview */}
                {post.content && (
                    <p className="text-sm text-foreground/80 line-clamp-2 mb-3 leading-relaxed">
                        {post.content}
                    </p>
                )}

                {/* Media Preview */}
                {post.type === 'IMAGE' && post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-3 aspect-video bg-secondary">
                        <img
                            src={`${backendUrl}${post.mediaUrl}`}
                            alt="Post"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}

                {post.type === 'VIDEO' && post.thumbnailUrl && (
                    <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-secondary">
                        <img
                            src={post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : `${backendUrl}${post.thumbnailUrl}`}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Engagement */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post._count?.likedBy || post.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post._count?.comments || 0}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

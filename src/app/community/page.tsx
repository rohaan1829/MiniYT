'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    ArrowLeft,
    Loader2,
    ThumbsUp,
    MessageSquare,
    Play,
    FileText,
    Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { postsApi, Post } from '@/lib/api/posts';
import Link from 'next/link';

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

export default function CommunityPage() {
    const { sidebarOpen } = useStore();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    useEffect(() => {
        useStore.setState({ sidebarOpen: true });
    }, []);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await postsApi.getFeed({ limit: 30, offset: 0 });
            if (response.success) {
                setPosts(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch community posts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <div className="min-h-screen bg-background text-foreground relative pb-32">
            <Header />
            <Sidebar />

            <PageContainer>
                <div className="max-w-3xl mx-auto space-y-8 px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-full hover:bg-secondary shrink-0"
                        >
                            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                <span className="text-[10px] md:text-sm font-bold text-primary uppercase tracking-widest">Discover</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Community</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Posts and updates from creators
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : posts.length === 0 ? (
                        <Card className="bg-card/40 border-dashed border-2 border-border/50">
                            <CardContent className="py-20 text-center">
                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-primary/40" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                    Explore channels and subscribe to see their posts here.
                                </p>
                                <Button onClick={() => router.push('/explore')} className="gap-2">
                                    <Compass className="w-4 h-4" />
                                    Explore Channels
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <CommunityPostCard key={post.id} post={post} backendUrl={backendUrl} />
                            ))}
                        </div>
                    )}
                </div>
            </PageContainer>
        </div>
    );
}

interface CommunityPostCardProps {
    post: Post;
    backendUrl: string;
}

function CommunityPostCard({ post, backendUrl }: CommunityPostCardProps) {
    const [liked, setLiked] = useState(false);
    const typeConfig = POST_TYPE_CONFIG[post.type || 'TEXT'];
    const timestamp = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    const channel = post.channel || post.user?.channel;

    const handleLike = async () => {
        setLiked(!liked);
        try {
            await postsApi.toggleLike(post.id);
        } catch (err) {
            setLiked(liked); // Revert on error
        }
    };

    return (
        <Card className="bg-white dark:bg-zinc-900 border-border/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 md:p-8">
                {/* Header with Channel and Badge */}
                <div className="flex items-center justify-between mb-6">
                    <Link href={channel ? `/channel/${channel.id}` : '#'} className="flex items-center gap-3 group">
                        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                            <AvatarImage src={channel?.avatarUrl || post.user?.image || undefined} />
                            <AvatarFallback className="text-sm font-bold">
                                {channel?.name?.[0] || post.user?.name?.[0] || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                                {channel?.name || post.user?.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                {timestamp.replace('about ', '')}
                            </p>
                        </div>
                    </Link>
                    <span className={cn(
                        "inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                        typeConfig.className
                    )}>
                        {typeConfig.label}
                    </span>
                </div>

                {/* Content Text */}
                {post.content && (
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-6">
                        {post.content}
                    </p>
                )}

                {/* Media - Video */}
                {post.type === 'VIDEO' && post.mediaUrl && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer shadow-lg mb-6">
                        <img
                            src={
                                post.thumbnailUrl
                                    ? (post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : `${backendUrl}${post.thumbnailUrl}`)
                                    : '/placeholder-video.jpg'
                            }
                            alt="Video thumbnail"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 transform group-hover:scale-105 transition-transform">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl">
                                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                                </div>
                                <span className="text-white font-black text-sm uppercase tracking-wider">Watch Now</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image */}
                {post.type === 'IMAGE' && post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden mb-6 shadow-md border border-border/30">
                        <img
                            src={`${backendUrl}${post.mediaUrl}`}
                            alt="Post"
                            className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-border/40">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all active:scale-95",
                                liked
                                    ? "bg-primary/10 text-primary shadow-inner"
                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
                            {post._count?.likedBy || post.likes || 0}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground font-bold text-sm transition-all active:scale-95">
                            <MessageSquare className="h-4 w-4" />
                            {post._count?.comments || 0}
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

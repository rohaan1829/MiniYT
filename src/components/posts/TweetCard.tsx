'use client';

import { useState } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    MessageCircle,
    Repeat2,
    Heart,
    Share,
    Bookmark,
    MoreHorizontal,
    Play,
    Trash2,
    Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration } from '@/lib/formatters';

interface TweetCardProps {
    post: Post;
    onDeleted?: (postId: string) => void;
}

export default function TweetCard({ post, onDeleted }: TweetCardProps) {
    const { user } = useStore();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const isOwner = user && user.id === post.userId;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const channelName = post.user?.channel?.name || post.user?.name || 'Unknown';
    const channelHandle = post.user?.channel?.handle || post.user?.name?.toLowerCase().replace(/\s+/g, '') || 'unknown';
    const channelAvatar = post.user?.channel?.avatarUrl || post.user?.image;

    const handleLike = async () => {
        if (!user) return;
        setIsLiking(true);

        // Optimistic update
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);

        try {
            const response = await postsApi.toggleLike(post.id);
            if (response.success) {
                setLiked(response.data.liked);
            }
        } catch (err) {
            // Revert on error
            setLiked(liked);
            setLikesCount(prev => liked ? prev + 1 : prev - 1);
            console.error('Like error:', err);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this post?')) return;
        setIsDeleting(true);
        try {
            const response = await postsApi.deletePost(post.id);
            if (response.success && onDeleted) {
                onDeleted(post.id);
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const renderMedia = () => {
        if (post.type === 'IMAGE' && post.mediaUrl) {
            return (
                <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                    <img
                        src={`${backendUrl}${post.mediaUrl}`}
                        alt="Post media"
                        className="w-full h-auto max-h-[500px] object-cover"
                    />
                </div>
            );
        }
        if (post.type === 'VIDEO' && post.mediaUrl) {
            return (
                <Link href={`/watch/${post.id}`} className="block mt-3">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video group">
                        {post.thumbnailUrl ? (
                            <img
                                src={`${backendUrl}${post.thumbnailUrl}`}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <Play className="h-12 w-12 text-white/30" />
                            </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <Play className="h-7 w-7 text-white fill-white ml-1" />
                            </div>
                        </div>
                    </div>
                </Link>
            );
        }
        return null;
    };

    return (
        <article className="border-b border-white/10 transition-colors hover:bg-white/[0.02]">
            <div className="p-4 flex gap-3">
                {/* Avatar */}
                <Link href={`/channel/${channelHandle}`} className="shrink-0">
                    <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                        <AvatarImage src={channelAvatar ? (channelAvatar.startsWith('http') ? channelAvatar : `${backendUrl}${channelAvatar}`) : undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {channelName[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 min-w-0 text-[15px]">
                            <Link
                                href={`/channel/${channelHandle}`}
                                className="font-bold hover:underline truncate"
                            >
                                {channelName}
                            </Link>
                            <span className="text-muted-foreground truncate">@{channelHandle}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground hover:underline shrink-0">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })}
                            </span>
                        </div>

                        {/* More Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-white/10">
                                {isOwner ? (
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-red-500 focus:text-red-500 gap-2"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem className="gap-2">
                                        <Flag className="h-4 w-4" />
                                        Report
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Post Content */}
                    {post.content && (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap mt-1">
                            {post.content}
                        </p>
                    )}

                    {/* Media */}
                    {renderMedia()}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between mt-3 -ml-2 max-w-md">
                        {/* Reply */}
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                <MessageCircle className="h-[18px] w-[18px]" />
                            </div>
                            <span className="text-sm">{post._count?.comments || ''}</span>
                        </button>

                        {/* Repost */}
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                <Repeat2 className="h-[18px] w-[18px]" />
                            </div>
                            <span className="text-sm"></span>
                        </button>

                        {/* Like */}
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-1.5 group transition-colors ${liked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'
                                }`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                                <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-sm">{likesCount > 0 ? likesCount : ''}</span>
                        </button>

                        {/* Bookmark */}
                        <button
                            onClick={() => setBookmarked(!bookmarked)}
                            className={`text-muted-foreground hover:text-primary group transition-colors ${bookmarked ? 'text-primary' : ''
                                }`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                <Bookmark className={`h-[18px] w-[18px] ${bookmarked ? 'fill-current' : ''}`} />
                            </div>
                        </button>

                        {/* Share */}
                        <button className="text-muted-foreground hover:text-primary group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                <Share className="h-[18px] w-[18px]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

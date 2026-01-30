'use client';

import { useState } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, MoreVertical, Trash2, Play, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostComments from './PostComments';

interface PostCardProps {
    post: Post;
    onDeleted?: (postId: string) => void;
}

// Post type badge configuration
const POST_TYPE_CONFIG = {
    TEXT: {
        label: 'Announcement',
        className: 'bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-300 border-pink-500/40',
        iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    },
    VIDEO: {
        label: 'New Video',
        className: 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/40',
        iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    IMAGE: {
        label: 'Update',
        className: 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-300 border-orange-500/40',
        iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    },
};

export default function PostCard({ post, onDeleted }: PostCardProps) {
    const { user } = useStore();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = user && user.id === post.userId;
    const typeConfig = POST_TYPE_CONFIG[post.type];
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const channelName = post.user?.channel?.name || post.user?.name || 'Unknown';
    const channelHandle = post.user?.channel?.handle;
    const channelAvatar = post.user?.channel?.avatarUrl || post.user?.image;

    // Helper to get proper media URL (handles both S3 URLs and local paths)
    const getMediaUrl = (url: string | undefined) => {
        if (!url) return undefined;
        // If it's already a full URL (S3), return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // Otherwise, prepend backend URL for local storage
        return `${backendUrl}${url}`;
    };

    const handleLike = async () => {
        if (!user) return;
        setIsLiking(true);
        try {
            const response = await postsApi.toggleLike(post.id);
            if (response.success) {
                setLiked(response.data.liked);
                setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
            }
        } catch (err) {
            console.error('Like error:', err);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
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
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/30 ring-1 ring-white/10">
                    <img
                        src={getMediaUrl(post.mediaUrl)}
                        alt="Post media"
                        className="w-full h-auto max-h-[500px] object-cover"
                    />
                </div>
            );
        }
        if (post.type === 'VIDEO' && post.mediaUrl) {
            const mediaUrl = getMediaUrl(post.mediaUrl);
            const thumbnailUrl = getMediaUrl(post.thumbnailUrl);

            return (
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-black/50 ring-1 ring-white/10">
                    <video
                        src={mediaUrl}
                        className="w-full max-h-[500px] object-contain"
                        controls
                        poster={thumbnailUrl}
                        preload="metadata"
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:border-white/20">
            {/* Decorative top gradient bar */}
            <div className={`h-1 w-full ${typeConfig.iconBg}`} />

            <div className="p-6 md:p-8">
                {/* Header - Creator info and badge */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <Link href={channelHandle ? `/channel/${channelHandle}` : '#'}>
                            <Avatar className="h-12 w-12 ring-2 ring-white/10 hover:ring-primary/50 transition-all">
                                <AvatarImage src={getMediaUrl(channelAvatar)} />
                                <AvatarFallback className={`${typeConfig.iconBg} text-white font-bold`}>
                                    {channelName[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>

                        <div>
                            <div className="flex items-center gap-3">
                                <Link href={channelHandle ? `/channel/${channelHandle}` : '#'} className="font-bold text-foreground hover:text-primary transition-colors">
                                    {channelName}
                                </Link>
                                <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${typeConfig.className}`}>
                                    {typeConfig.label}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {formatDistanceToNow(new Date(post.createdAt))} ago
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10">
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-xl border-white/10">
                            {isOwner ? (
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-destructive focus:text-destructive flex items-center gap-2"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Post
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="flex items-center gap-2">
                                    Report Post
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Content */}
                {post.content && (
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px] mb-5">
                        {post.content}
                    </p>
                )}

                {/* Media */}
                {(post.type === 'VIDEO' || post.type === 'IMAGE') && post.mediaUrl && (
                    <div className="mb-5">
                        {renderMedia()}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-5 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${liked
                                ? 'bg-pink-500/20 text-pink-400'
                                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                                }`}
                        >
                            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${showComments
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                                }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>{post._count.comments > 0 ? post._count.comments : 'Comment'}</span>
                        </button>
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

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-5 pt-5 border-t border-white/10">
                        <PostComments postId={post.id} />
                    </div>
                )}
            </div>
        </div>
    );
}

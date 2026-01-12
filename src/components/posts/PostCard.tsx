'use client';

import { useState } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThumbsUp, MessageSquare, MoreVertical, Trash2, Play } from 'lucide-react';
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
        className: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    },
    VIDEO: {
        label: 'New Video',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    IMAGE: {
        label: 'Update',
        className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
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
                <div className="rounded-xl overflow-hidden bg-black/20">
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
                <Link href={`/watch/${post.id}`} className="block">
                    <div className="relative rounded-xl overflow-hidden bg-black/30 aspect-video group cursor-pointer">
                        {/* Thumbnail or video poster */}
                        {post.thumbnailUrl ? (
                            <img
                                src={`${backendUrl}${post.thumbnailUrl}`}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <video
                                src={`${backendUrl}${post.mediaUrl}`}
                                className="w-full h-full object-cover"
                                muted
                            />
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 transition-all group-hover:bg-black/40">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="h-6 w-6 text-black fill-black ml-1" />
                            </div>
                            <span className="text-white font-semibold text-lg drop-shadow-lg">
                                Watch on MiniYT
                            </span>
                        </div>
                    </div>
                </Link>
            );
        }
        return null;
    };

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-5 md:p-6">
                {/* Header - Badge and Menu */}
                <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${typeConfig.className}`}>
                        {typeConfig.label}
                    </span>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
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

                {/* Media first if it's a video/image post */}
                {(post.type === 'VIDEO' || post.type === 'IMAGE') && post.mediaUrl && (
                    <div className="mb-4">
                        {renderMedia()}
                    </div>
                )}

                {/* Content */}
                {post.content && (
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base mb-4">
                        {post.content}
                    </p>
                )}

                {/* Footer - Timestamp left, Actions right */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-105 ${liked ? 'text-pink-500' : 'text-pink-400 hover:text-pink-500'
                                }`}
                        >
                            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                            <span>Like</span>
                            {likesCount > 0 && <span className="text-muted-foreground">({likesCount})</span>}
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-105 ${showComments ? 'text-pink-500' : 'text-pink-400 hover:text-pink-500'
                                }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>Comment</span>
                            {post._count.comments > 0 && <span className="text-muted-foreground">({post._count.comments})</span>}
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <PostComments postId={post.id} />
                    </div>
                )}
            </div>
        </Card>
    );
}

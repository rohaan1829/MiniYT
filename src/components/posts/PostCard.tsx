'use client';

import { useState } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageSquare, MoreVertical, Trash2, Globe, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '@/store/useStore';
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

export default function PostCard({ post, onDeleted }: PostCardProps) {
    const { user } = useStore();
    const [liked, setLiked] = useState(false); // In a real app, this should come from the post data
    const [likesCount, setLikesCount] = useState(post.likes);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = user && user.id === post.userId;

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
                <div className="mt-4 rounded-xl overflow-hidden border border-white/5 bg-black/20">
                    <img
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}${post.mediaUrl}`}
                        alt="Post media"
                        className="w-full h-auto max-h-[600px] object-contain"
                    />
                </div>
            );
        }
        if (post.type === 'VIDEO' && post.mediaUrl) {
            return (
                <div className="mt-4 rounded-xl overflow-hidden border border-white/5 bg-black/20 aspect-video">
                    <video
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}${post.mediaUrl}`}
                        controls
                        className="w-full h-full object-contain"
                        poster={post.thumbnailUrl ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}${post.thumbnailUrl}` : undefined}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="bg-secondary/20 border-white/5 overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-primary/5">
                            <AvatarImage src={post.user.image} />
                            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base hover:text-primary transition-colors cursor-pointer">{post.user.name}</h3>
                                {post.visibility === 'PUBLIC' ? (
                                    <Globe className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                    <Users className="h-3 w-3 text-primary/70" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                                {formatDistanceToNow(new Date(post.createdAt))} ago
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/5">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
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
                <div className="space-y-4">
                    {post.content && (
                        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
                            {post.content}
                        </p>
                    )}

                    {renderMedia()}
                </div>

                {/* Footer / Interactions */}
                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-2 text-sm font-bold transition-all hover:scale-105 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                        <span>{likesCount}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-2 text-sm font-bold transition-all hover:scale-105 text-muted-foreground hover:text-foreground ${showComments ? 'text-primary' : ''}`}
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span>{post._count.comments}</span>
                    </button>

                    <div className="flex-1" />
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <PostComments postId={post.id} />
                    </div>
                )}
            </div>
        </Card>
    );
}

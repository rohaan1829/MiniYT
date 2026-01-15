'use client';

import { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Eye, Shield, ThumbsUp, Heart, Reply, Pin, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/formatters';
import { commentsApi, PublicComment, PublicCommentsResponse } from '@/lib/api/interactions';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

interface PublicCommentsProps {
    videoId: string;
}

export default function PublicComments({ videoId }: PublicCommentsProps) {
    const { user, isAuthenticated } = useStore();
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<PublicComment[]>([]);
    const [creatorId, setCreatorId] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

    const fetchPublicComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await commentsApi.getPublicComments(videoId);
            if (response.success) {
                setComments(response.data.comments);
                setCreatorId(response.data.creatorId);
            }
        } catch (err) {
            console.error('Failed to fetch public comments:', err);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        fetchPublicComments();
    }, [fetchPublicComments]);

    const handleLikeComment = (commentId: string) => {
        setLikedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    // Check if a comment is by the current logged-in user
    const isOwnComment = (commentUserId: string) => user?.id === commentUserId;

    // Check if comment was viewed by creator (isRead is true and no replies yet or comment is public)
    const wasViewedByCreator = (comment: PublicComment) => {
        return comment.isRead && !comment.replies?.length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-8">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <MessageSquare size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Comments</h3>
                        <p className="text-xs text-muted-foreground">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Sort dropdown could go here */}
            </div>

            {/* Comment Input */}
            {isAuthenticated && (
                <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-primary/20">
                                <AvatarImage src={user?.image || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-pink-500 text-white">
                                    {user?.name?.[0] || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[80px] bg-secondary/50 border-0 focus-visible:ring-primary/20 resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setNewComment('')}>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={!newComment.trim() || submitting}
                                        className="gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Comment
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-dashed border-2 border-border/50">
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-primary/30" />
                        </div>
                        <h4 className="font-bold mb-1">No comments yet</h4>
                        <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment, index) => (
                        <Card
                            key={comment.id}
                            className={cn(
                                "bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 overflow-hidden",
                                index === 0 && "ring-2 ring-primary/10" // Highlight first/top comment
                            )}
                        >
                            <CardContent className="p-5">
                                {/* Pinned indicator for first comment */}
                                {index === 0 && (
                                    <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-3">
                                        <Pin className="w-3.5 h-3.5" />
                                        Top Comment
                                    </div>
                                )}

                                {/* Original Comment */}
                                <div className="flex gap-4">
                                    <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-border">
                                        <AvatarImage src={comment.user.image || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-sm">
                                            {comment.user.name?.[0] || comment.user.username[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="font-bold text-sm">
                                                {comment.user.name || comment.user.username}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTimeAgo(comment.createdAt)}
                                            </span>
                                            {/* Viewed by Creator indicator for own comments */}
                                            {isOwnComment(comment.user.id) && comment.isRead && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-500 text-[10px] font-bold rounded-full">
                                                    <Eye className="w-3 h-3" />
                                                    Viewed by Creator
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>

                                        {/* Comment Actions */}
                                        <div className="flex items-center gap-1 mt-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-8 px-3 gap-1.5 rounded-full text-xs",
                                                    likedComments.has(comment.id) && "text-primary bg-primary/10"
                                                )}
                                                onClick={() => handleLikeComment(comment.id)}
                                            >
                                                <Heart className={cn("w-3.5 h-3.5", likedComments.has(comment.id) && "fill-primary")} />
                                                {likedComments.has(comment.id) ? 'Liked' : 'Like'}
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 rounded-full text-xs">
                                                <Reply className="w-3.5 h-3.5" />
                                                Reply
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Creator Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-5 ml-14 space-y-3">
                                        {comment.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className={cn(
                                                    "flex gap-3 p-4 rounded-2xl",
                                                    reply.user.id === creatorId
                                                        ? "bg-gradient-to-r from-primary/5 via-primary/5 to-transparent border border-primary/20"
                                                        : "bg-secondary/30"
                                                )}
                                            >
                                                <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-primary/30">
                                                    <AvatarImage src={reply.user.image || undefined} />
                                                    <AvatarFallback className={cn(
                                                        "text-xs",
                                                        reply.user.id === creatorId
                                                            ? "bg-gradient-to-br from-primary to-pink-500 text-white"
                                                            : "bg-gray-400 text-white"
                                                    )}>
                                                        {reply.user.name?.[0] || reply.user.username[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                        <span className="font-bold text-sm">
                                                            {reply.user.name || reply.user.username}
                                                        </span>
                                                        {reply.user.id === creatorId && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-primary to-pink-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                                                                <Sparkles className="w-3 h-3" />
                                                                CREATOR
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTimeAgo(reply.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/90 leading-relaxed">{reply.content}</p>

                                                    {/* Reply Actions */}
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 rounded-full text-[11px]">
                                                            <Heart className="w-3 h-3" />
                                                            Like
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


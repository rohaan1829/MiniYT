'use client';

import { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare, Eye, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/formatters';
import { commentsApi, PublicComment, PublicCommentsResponse } from '@/lib/api/interactions';
import { useStore } from '@/store/useStore';

interface PublicCommentsProps {
    videoId: string;
}

export default function PublicComments({ videoId }: PublicCommentsProps) {
    const { user } = useStore();
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<PublicComment[]>([]);
    const [creatorId, setCreatorId] = useState<string | null>(null);

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

    // Check if a comment is by the current logged-in user
    const isOwnComment = (commentUserId: string) => user?.id === commentUserId;

    // Check if comment was viewed by creator (isRead is true and no replies yet or comment is public)
    const wasViewedByCreator = (comment: PublicComment) => {
        return comment.isRead && !comment.replies?.length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (comments.length === 0) {
        return null; // Don't show anything if no public comments
    }

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Comments</h3>
                <span className="text-sm text-muted-foreground">({comments.length})</span>
            </div>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <Card key={comment.id} className="bg-card/40 border-border/50">
                        <CardContent className="p-4">
                            {/* Original Comment */}
                            <div className="flex gap-3">
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={comment.user.image || undefined} />
                                    <AvatarFallback>
                                        {comment.user.name?.[0] || comment.user.username[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-bold text-sm">
                                            {comment.user.name || comment.user.username}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTimeAgo(comment.createdAt)}
                                        </span>
                                        {/* Viewed by Creator indicator for own comments */}
                                        {isOwnComment(comment.user.id) && comment.isRead && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full">
                                                <Eye className="w-3 h-3" />
                                                Viewed by Creator
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-foreground/90">{comment.content}</p>
                                </div>
                            </div>

                            {/* Creator Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 ml-12 space-y-3">
                                    {comment.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={cn(
                                                "flex gap-3 p-3 rounded-xl",
                                                reply.user.id === creatorId
                                                    ? "bg-primary/5 border border-primary/20"
                                                    : "bg-secondary/30"
                                            )}
                                        >
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                <AvatarImage src={reply.user.image || undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {reply.user.name?.[0] || reply.user.username[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-bold text-sm">
                                                        {reply.user.name || reply.user.username}
                                                    </span>
                                                    {reply.user.id === creatorId && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                                                            <Shield className="w-3 h-3" />
                                                            CREATOR
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTimeAgo(reply.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/90">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

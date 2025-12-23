'use client';

import { useState, useEffect } from 'react';
import { PostComment, postsApi } from '@/lib/api/posts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '@/store/useStore';

interface PostCommentsProps {
    postId: string;
}

export default function PostComments({ postId }: PostCommentsProps) {
    const { user } = useStore();
    const [comments, setComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await postsApi.getComments(postId);
            if (response.success) {
                setComments(response.data);
            }
        } catch (err) {
            console.error('Fetch comments error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAddComment = async () => {
        if (!newComment.trim() || !user) return;
        setIsSubmitting(true);
        try {
            const response = await postsApi.addComment(postId, newComment);
            if (response.success) {
                setNewComment('');
                fetchComments(); // In a real app, maybe just pre-append the new comment
            }
        } catch (err) {
            console.error('Add comment error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && comments.length === 0) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Add Comment */}
            {user ? (
                <div className="flex gap-4">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                        <Textarea
                            placeholder="Write a comment..."
                            className="min-h-[80px] bg-white/5 border-white/5 focus:ring-primary/20 resize-none text-sm placeholder:text-muted-foreground/50 rounded-xl"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                onClick={handleAddComment}
                                disabled={isSubmitting || !newComment.trim()}
                                className="rounded-full px-4 font-bold h-8"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="w-3 h-3 mr-2" /> Post Comment</>}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground bg-white/5 p-3 rounded-lg text-center">
                    Please log in to leave a comment.
                </p>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic pl-12">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Avatar className="h-8 w-8 ring-1 ring-white/5">
                                <AvatarImage src={comment.user.image} />
                                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="bg-white/5 rounded-2xl p-3 inline-block max-w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-foreground/90">{comment.user.name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt))} ago
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm text-foreground/80 leading-relaxed overflow-wrap-break-word">
                                        {comment.content}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 ml-2">
                                    <button className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">Like</button>
                                    <button className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">Reply</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

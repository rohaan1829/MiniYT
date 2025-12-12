'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Comment } from '@/data/mockData';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Comments({ comments }: { comments: Comment[] }) {
    if (!comments) return null;

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold mb-6">{comments.length} Comments</h3>

            {/* Add Comment Input */}
            <div className="flex gap-4 mb-8">
                <Avatar className="w-10 h-10">
                    <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <Input
                        placeholder="Add a comment..."
                        className="bg-transparent border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0 px-0 focus:border-foreground transition-colors"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" className="rounded-full">Cancel</Button>
                        <Button className="rounded-full bg-primary/20 text-primary hover:bg-primary/30" disabled>Comment</Button>
                    </div>
                </div>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <Avatar className="w-10 h-10 mt-1">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{comment.user}</span>
                                <span className="text-xs text-muted-foreground">{comment.postedAt}</span>
                            </div>
                            <p className="text-sm mb-2">{comment.content}</p>

                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                                    <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <span className="text-xs text-muted-foreground">{comment.likes}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                                    <ThumbsDown className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-semibold hover:bg-muted">
                                    Reply
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Image, Film, BarChart3, Smile, MapPin, Loader2 } from 'lucide-react';
import { postsApi } from '@/lib/api/posts';

interface ComposePostProps {
    onPostCreated?: () => void;
}

export default function ComposePost({ onPostCreated }: ComposePostProps) {
    const { user, isAuthenticated, setUploadDialogOpen } = useStore();
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    const MAX_CHARS = 280;
    const charsRemaining = MAX_CHARS - content.length;
    const isOverLimit = charsRemaining < 0;

    const handleSubmit = async () => {
        if (!content.trim() || isOverLimit || isPosting) return;

        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append('content', content.trim());
            formData.append('type', 'TEXT');
            formData.append('visibility', 'PUBLIC');

            const response = await postsApi.createPost(formData);

            if (response.success) {
                setContent('');
                setIsFocused(false);
                onPostCreated?.();
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target;
        setContent(target.value);
        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="border-b border-white/10">
            <div className="p-4 flex gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {(user.name || user.username)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Composer Area */}
                <div className="flex-1 min-w-0">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleInput}
                        onFocus={() => setIsFocused(true)}
                        placeholder="What's happening?"
                        className="w-full bg-transparent text-xl placeholder:text-muted-foreground resize-none outline-none min-h-[60px] py-2"
                        rows={1}
                    />

                    {/* Action Bar - Shows when focused or has content */}
                    {(isFocused || content) && (
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3">
                            {/* Media Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setUploadDialogOpen(true)}
                                    className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
                                    title="Add Image"
                                >
                                    <Image className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadDialogOpen(true)}
                                    className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
                                    title="Add Video"
                                >
                                    <Film className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors opacity-50 cursor-not-allowed"
                                    title="Poll (coming soon)"
                                    disabled
                                >
                                    <BarChart3 className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors opacity-50 cursor-not-allowed"
                                    title="Emoji (coming soon)"
                                    disabled
                                >
                                    <Smile className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Character Count & Post Button */}
                            <div className="flex items-center gap-3">
                                {content.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`text-sm font-medium ${isOverLimit
                                                ? 'text-red-500'
                                                : charsRemaining <= 20
                                                    ? 'text-yellow-500'
                                                    : 'text-muted-foreground'
                                                }`}
                                        >
                                            {charsRemaining}
                                        </div>
                                        <div className="w-px h-6 bg-white/10" />
                                    </div>
                                )}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!content.trim() || isOverLimit || isPosting}
                                    className="rounded-full px-5 font-bold bg-primary hover:bg-primary/90"
                                >
                                    {isPosting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Post'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

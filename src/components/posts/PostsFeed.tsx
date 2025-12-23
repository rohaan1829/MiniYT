'use client';

import { useState, useEffect } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, MessageSquare } from 'lucide-react';
import CreatePostDialog from './CreatePostDialog';

interface PostsFeedProps {
    channelId: string;
    isOwner: boolean;
}

export default function PostsFeed({ channelId, isOwner }: PostsFeedProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await postsApi.getChannelPosts(channelId);
            if (response.success) {
                setPosts(response.data);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [channelId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePostCreated = () => {
        setIsCreateOpen(false);
        fetchPosts();
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-destructive">
                <p>{error}</p>
                <Button variant="link" onClick={fetchPosts}>Try again</Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {isOwner && (
                <div className="bg-secondary/30 rounded-xl p-6 border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-muted-foreground font-medium">Share an update with your community...</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                        Create Post
                    </Button>
                </div>
            )}

            {posts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-2xl border border-dashed border-white/10">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-xl font-semibold mb-2">No posts yet</p>
                    <p className="text-sm">When the creator shares updates, they&apos;ll appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDeleted={handlePostDeleted}
                        />
                    ))}
                </div>
            )}

            <CreatePostDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={handlePostCreated}
                channelId={channelId}
            />
        </div>
    );
}

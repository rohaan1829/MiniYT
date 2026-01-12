'use client';

import { useState, useEffect } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import PostCard from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Newspaper } from 'lucide-react';

export default function HomeFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await postsApi.getFeed({ limit: 30 });
            if (response.success) {
                setPosts(response.data);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handlePostDeleted = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Loading your feed...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/20">
                <p className="text-destructive font-medium mb-4">{error}</p>
                <Button variant="outline" onClick={fetchFeed} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </Button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-2xl border border-dashed border-white/10">
                <Newspaper className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-2xl font-bold mb-2">No posts yet</p>
                <p className="text-sm max-w-md mx-auto">
                    When creators share updates, they&apos;ll appear here. Subscribe to your favorite channels to stay updated!
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onDeleted={handlePostDeleted}
                />
            ))}
        </div>
    );
}

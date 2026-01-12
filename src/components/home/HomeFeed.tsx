'use client';

import { useState, useEffect } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import PostCard from '@/components/posts/PostCard';
import FeedVideoCard from './FeedVideoCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Newspaper } from 'lucide-react';

// Feed item can be a post or a video
interface FeedItem {
    id: string;
    createdAt: string;
    updatedAt?: string;
    feedType: 'post' | 'video';
    // Post fields
    type?: 'TEXT' | 'IMAGE' | 'VIDEO';
    content?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    visibility?: string;
    likes?: number;
    userId?: string;
    channelId?: string;
    user?: any;
    channel?: any;
    _count?: { comments: number; likedBy: number };
    // Video fields
    title?: string;
    description?: string;
    videoUrl?: string;
    views?: number;
    duration?: number;
    likeCount?: number;
    status?: string;
}

export default function HomeFeed() {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await postsApi.getFeed({ limit: 30 });
            if (response.success) {
                setFeedItems(response.data);
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
        setFeedItems(feedItems.filter(item => item.id !== postId));
    };

    if (loading && feedItems.length === 0) {
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

    if (feedItems.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground bg-secondary/10 rounded-2xl border border-dashed border-white/10">
                <Newspaper className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-2xl font-bold mb-2">No content yet</p>
                <p className="text-sm max-w-md mx-auto">
                    When creators share videos and updates, they&apos;ll appear here. Subscribe to your favorite channels to stay updated!
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {feedItems.map((item) => {
                if (item.feedType === 'video') {
                    return (
                        <FeedVideoCard
                            key={`video-${item.id}`}
                            video={{
                                id: item.id,
                                title: item.title || 'Untitled Video',
                                description: item.description,
                                thumbnailUrl: item.thumbnailUrl,
                                videoUrl: item.videoUrl,
                                views: item.views || 0,
                                duration: item.duration,
                                likeCount: item.likeCount,
                                createdAt: item.createdAt,
                                user: item.user,
                            }}
                        />
                    );
                }

                // It's a post
                return (
                    <PostCard
                        key={`post-${item.id}`}
                        post={item as Post}
                        onDeleted={handlePostDeleted}
                    />
                );
            })}
        </div>
    );
}

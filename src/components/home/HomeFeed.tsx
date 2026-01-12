'use client';

import { useState, useEffect } from 'react';
import { Post, postsApi } from '@/lib/api/posts';
import TweetCard from '@/components/posts/TweetCard';
import VideoTweetCard from './VideoTweetCard';
import ComposePost from './ComposePost';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

type FeedTab = 'for-you' | 'following';

export default function HomeFeed() {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FeedTab>('for-you');

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

    const handlePostCreated = () => {
        fetchFeed();
    };

    return (
        <div className="min-h-screen">
            {/* Sticky Header with Tabs */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('for-you')}
                        className={cn(
                            "flex-1 py-4 text-center font-bold text-[15px] transition-colors relative",
                            activeTab === 'for-you'
                                ? "text-foreground"
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        For you
                        {activeTab === 'for-you' && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={cn(
                            "flex-1 py-4 text-center font-bold text-[15px] transition-colors relative",
                            activeTab === 'following'
                                ? "text-foreground"
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        Following
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Compose Post */}
            <ComposePost onPostCreated={handlePostCreated} />

            {/* Feed Content */}
            {loading && feedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button variant="outline" onClick={fetchFeed} className="gap-2 rounded-full">
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                </div>
            ) : feedItems.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-xl font-bold mb-2">Welcome to MiniYT</p>
                    <p className="text-sm">
                        Follow creators to see their posts and videos here.
                    </p>
                </div>
            ) : (
                <div>
                    {feedItems.map((item) => {
                        if (item.feedType === 'video') {
                            return (
                                <VideoTweetCard
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
                            <TweetCard
                                key={`post-${item.id}`}
                                post={item as Post}
                                onDeleted={handlePostDeleted}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SubscribeButton from '@/components/channel/SubscribeButton';
import {
    Users,
    Video,
    Loader2,
    ArrowLeft,
    Compass,
    Bell,
    BellOff
} from 'lucide-react';
import VideoCard from '@/components/video/VideoCard';
import { cn } from '@/lib/utils';
import { formatTimeAgo, formatViews } from '@/lib/formatters';
import { subscriptionsApi, SubscribedChannel, SubscriptionFeedVideo } from '@/lib/api/subscriptions';
import Link from 'next/link';

type TabView = 'feed' | 'channels';

export default function SubscriptionsPage() {
    const { user } = useStore();
    const router = useRouter();
    const [view, setView] = useState<TabView>('feed');

    // Feed state
    const [feedVideos, setFeedVideos] = useState<SubscriptionFeedVideo[]>([]);
    const [loadingFeed, setLoadingFeed] = useState(true);
    const [feedTotal, setFeedTotal] = useState(0);

    // Channels state
    const [channels, setChannels] = useState<SubscribedChannel[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(true);
    const [channelsTotal, setChannelsTotal] = useState(0);

    useEffect(() => {
        useStore.setState({ sidebarOpen: true });
    }, []);

    const fetchFeed = useCallback(async () => {
        setLoadingFeed(true);
        try {
            const response = await subscriptionsApi.getSubscriptionFeed(20, 0);
            if (response.success) {
                setFeedVideos(response.data.videos);
                setFeedTotal(response.data.total);
            }
        } catch (err) {
            console.error('Failed to load subscription feed:', err);
        } finally {
            setLoadingFeed(false);
        }
    }, []);

    const fetchChannels = useCallback(async () => {
        setLoadingChannels(true);
        try {
            const response = await subscriptionsApi.getSubscriptions(50, 0);
            if (response.success) {
                setChannels(response.data.subscriptions);
                setChannelsTotal(response.data.total);
            }
        } catch (err) {
            console.error('Failed to load subscriptions:', err);
        } finally {
            setLoadingChannels(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchFeed();
            fetchChannels();
        }
    }, [user, fetchFeed, fetchChannels]);

    const handleUnsubscribed = (channelId: string) => {
        setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
        setChannelsTotal((prev) => prev - 1);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer>
                    <div className="max-w-6xl mx-auto space-y-8 px-4 py-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.back()}
                                    className="rounded-full hover:bg-secondary"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight">Subscriptions</h1>
                                    <p className="text-muted-foreground mt-1">
                                        {channelsTotal} channel{channelsTotal !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="hidden lg:flex items-center gap-6 bg-card/40 backdrop-blur-md border border-border/50 p-4 rounded-2xl">
                                <div className="text-center px-4 border-r border-border/50">
                                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Subscribed</p>
                                    <p className="text-xl font-black text-primary">{channelsTotal}</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">New Videos</p>
                                    <p className="text-xl font-black">{feedTotal}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tab Selector */}
                        <div className="flex bg-card/50 backdrop-blur-md p-1 rounded-2xl border border-border/50 w-fit">
                            <button
                                onClick={() => setView('feed')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                    view === 'feed'
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Video className="w-4 h-4" />
                                Latest Videos
                            </button>
                            <button
                                onClick={() => setView('channels')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                    view === 'channels'
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Users className="w-4 h-4" />
                                Channels
                                <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-xs rounded-full">
                                    {channelsTotal}
                                </span>
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-6">
                            {/* Feed Tab */}
                            {view === 'feed' && (
                                <div>
                                    {loadingFeed ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : feedVideos.length === 0 ? (
                                        <Card className="bg-card/40 border-dashed border-2 border-border/50">
                                            <CardContent className="py-20 text-center">
                                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Video className="w-10 h-10 text-primary/40" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                                    {channelsTotal === 0
                                                        ? "Subscribe to channels to see their latest videos here."
                                                        : "Your subscribed channels haven't uploaded any videos yet."}
                                                </p>
                                                {channelsTotal === 0 && (
                                                    <Button onClick={() => router.push('/explore')} className="gap-2">
                                                        <Compass className="w-4 h-4" />
                                                        Explore channels
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                            {feedVideos.map((video) => (
                                                <VideoCard key={video.id} video={video} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Channels Tab */}
                            {view === 'channels' && (
                                <div>
                                    {loadingChannels ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : channels.length === 0 ? (
                                        <Card className="bg-card/40 border-dashed border-2 border-border/50">
                                            <CardContent className="py-20 text-center">
                                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Users className="w-10 h-10 text-primary/40" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">No subscriptions</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                                    Find creators you love and subscribe to stay updated with their content.
                                                </p>
                                                <Button onClick={() => router.push('/explore')} className="gap-2">
                                                    <Compass className="w-4 h-4" />
                                                    Explore channels
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {channels.map((channel) => (
                                                <Card
                                                    key={channel.id}
                                                    className="bg-card/40 border-border/50 hover:border-primary/30 transition-all"
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="flex items-center gap-4">
                                                            <Link href={`/channel/${channel.handle}`}>
                                                                <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                                                                    <AvatarImage src={channel.avatarUrl || undefined} />
                                                                    <AvatarFallback className="text-lg font-bold">
                                                                        {channel.name[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </Link>
                                                            <div className="flex-1 min-w-0">
                                                                <Link href={`/channel/${channel.handle}`}>
                                                                    <h3 className="font-bold text-base truncate hover:text-primary transition-colors">
                                                                        {channel.name}
                                                                        {channel.verified && (
                                                                            <span className="ml-1 text-primary text-sm">✓</span>
                                                                        )}
                                                                    </h3>
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    {channel.handle}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatViews(channel.subscriberCount)} subscribers
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                {channel.notifyOnNewVideo ? (
                                                                    <>
                                                                        <Bell className="w-3.5 h-3.5 text-primary" />
                                                                        <span>Notifications on</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <BellOff className="w-3.5 h-3.5" />
                                                                        <span>Notifications off</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <SubscribeButton
                                                                channelId={channel.id}
                                                                channelName={channel.name}
                                                                initialSubscribed={true}
                                                                initialNotify={channel.notifyOnNewVideo}
                                                                size="sm"
                                                                onSubscribeChange={(subscribed) => {
                                                                    if (!subscribed) {
                                                                        handleUnsubscribed(channel.id);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </PageContainer>
            </div>
        </ProtectedRoute>
    );
}

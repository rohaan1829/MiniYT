'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Loader2, Home, Video, Users, Info, Bell, BellRing, Settings } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useStore } from '@/store/useStore';
import { channelApi } from '@/lib/api/channels';
import { videoApi, VideoData } from '@/lib/api/videos';
import Link from 'next/link';
import VideoUploadDialog from '@/components/video/VideoUploadDialog';
import SubscribeButton from '@/components/channel/SubscribeButton';
import { formatViews } from '@/lib/formatters';
import CommunityFeed from '@/components/channel/CommunityFeed';
import ChannelHome from '@/components/channel/ChannelHome';
import ChannelContentGrid from '@/components/channel/ChannelContentGrid';
import { cn } from '@/lib/utils';

interface ChannelData {
    id: string;
    handle: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    subscriberCount: number;
    videoCount: number;
    verified: boolean;
    ownerId: string;
    isSubscribed: boolean;
    notifyOnNewVideo: boolean;
}

type TabType = 'home' | 'videos' | 'community' | 'about';

export default function ChannelPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user } = useStore();

    const [channel, setChannel] = useState<ChannelData | null>(null);
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const isOwner = user && channel && user.id === channel.ownerId;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    const fetchChannelData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            let response;
            if (id.startsWith('@') || id.startsWith('%40')) {
                const handle = id.startsWith('%40') ? '@' + id.slice(3) : id;
                response = await channelApi.getByHandle(handle);
            } else {
                response = await channelApi.getChannel(id);
            }
            setChannel(response.data);

            // Fetch channel videos for the Home and Videos tabs
            const videosResponse = await videoApi.getVideos({ channelId: response.data.id });
            setVideos(videosResponse.data || []);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('Channel not found');
            } else {
                setError(err.response?.data?.message || 'Failed to load channel');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChannelData();
    }, [id, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !channel) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <Sidebar />
                <PageContainer>
                    <div className="flex flex-col items-center justify-center py-20">
                        <h1 className="text-2xl font-bold mb-2">Channel Not Found</h1>
                        <p className="text-muted-foreground mb-6">{error || "The channel you're looking for doesn't exist."}</p>
                        <Link href="/">
                            <Button>Go Home</Button>
                        </Link>
                    </div>
                </PageContainer>
            </div>
        );
    }

    const tabs = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'about', label: 'About', icon: Info },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Sidebar />

            <PageContainer className="p-0">
                {/* Banner Section */}
                <div className="relative w-full aspect-[6/1] md:aspect-[8/1] min-h-[120px] bg-gradient-to-r from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                    {channel.bannerUrl && (
                        <img
                            src={channel.bannerUrl.startsWith('http') ? channel.bannerUrl : `${backendUrl}${channel.bannerUrl}`}
                            alt={channel.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {isOwner && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white border-none rounded-full"
                        >
                            Edit Banner
                        </Button>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    {/* Header Info Section */}
                    <div className="flex flex-col md:flex-row gap-6 py-8">
                        {/* Avatar */}
                        <div className="relative -mt-16 md:-mt-20 shrink-0">
                            <div className="h-24 w-24 md:h-40 md:w-40 rounded-full border-4 border-background overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-xl">
                                <img
                                    src={channel.avatarUrl ? (channel.avatarUrl.startsWith('http') ? channel.avatarUrl : `${backendUrl}${channel.avatarUrl}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.name}`}
                                    alt={channel.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Text and Actions */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">{channel.name}</h1>
                                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground font-medium">
                                        <span>{channel.handle}</span>
                                        <span>•</span>
                                        <span>{formatViews(channel.subscriberCount)} subscribers</span>
                                        <span>•</span>
                                        <span>{channel.videoCount} videos</span>
                                    </div>
                                    {channel.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl pt-2">
                                            {channel.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {isOwner ? (
                                        <>
                                            <Button
                                                onClick={() => setIsUploadOpen(true)}
                                                className="rounded-full px-6 font-bold"
                                            >
                                                Upload Video
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="rounded-full px-6 font-bold"
                                            >
                                                Customize Channel
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <SubscribeButton
                                                channelId={channel.id}
                                                channelName={channel.name}
                                                initialSubscribed={channel.isSubscribed}
                                                initialNotify={channel.notifyOnNewVideo}
                                                subscriberCount={channel.subscriberCount}
                                                size="lg"
                                            />
                                            {channel.isSubscribed && (
                                                <Button variant="ghost" size="icon" className="rounded-full">
                                                    <Bell className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-b border-border mb-6 flex items-center justify-between sticky top-[64px] bg-background/95 backdrop-blur-md z-10 -mx-4 px-4 md:-mx-8 md:px-8">
                        <div className="flex gap-2 sm:gap-6 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={cn(
                                            "flex items-center gap-2 py-4 px-1 border-b-2 transition-all whitespace-nowrap font-bold text-sm uppercase tracking-wider",
                                            activeTab === tab.id
                                                ? "border-primary text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="pb-20 animate-page-enter">
                        {activeTab === 'home' && (
                            <ChannelHome
                                videos={videos}
                                channel={{
                                    ...channel,
                                    avatarUrl: channel.avatarUrl ? (channel.avatarUrl.startsWith('http') ? channel.avatarUrl : `${backendUrl}${channel.avatarUrl}`) : undefined
                                }}
                                isOwner={isOwner || false}
                            />
                        )}

                        {activeTab === 'videos' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">All Videos</h2>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="sm" className="rounded-full">Newest</Button>
                                        <Button variant="ghost" size="sm" className="rounded-full">Popular</Button>
                                    </div>
                                </div>
                                <ChannelContentGrid
                                    channelId={channel.id}
                                    type="videos"
                                    videos={videos}
                                    isOwner={isOwner || false}
                                />
                            </div>
                        )}

                        {activeTab === 'community' && (
                            <div className="max-w-3xl mx-auto">
                                <CommunityFeed
                                    channelId={channel.id}
                                    isOwner={isOwner || false}
                                />
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="grid md:grid-cols-3 gap-12">
                                <div className="md:col-span-2 space-y-8">
                                    <section>
                                        <h3 className="text-lg font-bold mb-4">Description</h3>
                                        <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                            {channel.description || "No description provided."}
                                        </p>
                                    </section>
                                    <section>
                                        <h3 className="text-lg font-bold mb-4">Channel Details</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-muted-foreground w-32">Handle</span>
                                                <span className="font-medium text-primary">{channel.handle}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-muted-foreground w-32">Subscriber Count</span>
                                                <span className="font-medium">{formatViews(channel.subscriberCount)}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-muted-foreground w-32">Total Videos</span>
                                                <span className="font-medium">{channel.videoCount}</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-border p-6 rounded-2xl">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Stats</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Info className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-sm">Joined Dec 2023</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Video className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-sm">{channel.videoCount} videos uploaded</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="w-full mt-6 text-primary hover:text-primary hover:bg-primary/5 font-bold">
                                            Share Channel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {channel && (
                        <VideoUploadDialog
                            isOpen={isUploadOpen}
                            onClose={() => setIsUploadOpen(false)}
                            onSuccess={fetchChannelData}
                        />
                    )}
                </div>
            </PageContainer>
        </div>
    );
}

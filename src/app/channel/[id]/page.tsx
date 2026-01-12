'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Upload, Loader2, Share2, MoreHorizontal } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useStore } from '@/store/useStore';
import { channelApi } from '@/lib/api/channels';
import { videoApi } from '@/lib/api/videos';
import Link from 'next/link';
import PostsFeed from '@/components/posts/PostsFeed';
import VideoUploadDialog from '@/components/video/VideoUploadDialog';
import { VideoData } from '@/lib/api/videos';
import SubscribeButton from '@/components/channel/SubscribeButton';
import { formatViews } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import ChannelContentGrid from '@/components/channel/ChannelContentGrid';

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

type TabType = 'post' | 'videos' | 'file' | 'gifts';

export default function ChannelPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user } = useStore();

    const [channel, setChannel] = useState<ChannelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('post');

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

    const fetchVideos = async () => {
        if (!channel?.id) return;

        setIsLoadingVideos(true);
        try {
            const response = await videoApi.getVideos({ channelId: channel.id });
            setVideos(response.data);
        } catch (err) {
            console.error('Failed to fetch videos:', err);
        } finally {
            setIsLoadingVideos(false);
        }
    };

    useEffect(() => {
        fetchChannelData();
    }, [id, user]);

    useEffect(() => {
        if (channel?.id) {
            fetchVideos();
        }
    }, [channel?.id]);

    const tabs: { key: TabType; label: string }[] = [
        { key: 'post', label: 'Post' },
        { key: 'videos', label: 'Videos' },
        { key: 'file', label: 'File' },
        { key: 'gifts', label: 'Gifts' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !channel) {
        return (
            <div className="min-h-screen bg-background text-foreground">
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

    return (
        <div className="min-h-screen bg-[#F8F8F8] dark:bg-background text-foreground">
            <Header />
            <Sidebar />

            <PageContainer>
                {/* Channel Profile Section - Centered */}
                <div className="flex flex-col items-center py-12 px-4">
                    {/* Circular Avatar */}
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl mb-4">
                        <AvatarImage
                            src={channel.avatarUrl ? (channel.avatarUrl.startsWith('http') ? channel.avatarUrl : `${backendUrl}${channel.avatarUrl}`) : undefined}
                        />
                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                            {channel.name[0]}
                        </AvatarFallback>
                    </Avatar>

                    {/* Channel Name */}
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                        {channel.name}
                    </h1>

                    {/* Handle */}
                    <p className="text-muted-foreground mb-1">
                        @{channel.handle.replace('@', '')}
                    </p>

                    {/* Subscriber Count */}
                    <p className="text-primary font-medium mb-6">
                        {formatViews(channel.subscriberCount)} subscribers
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-8">
                        {/* Share Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full border border-border h-10 w-10"
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>

                        {/* Subscribe/Joined Button */}
                        {isOwner ? (
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="rounded-full px-6 font-bold bg-primary text-primary-foreground h-10"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </Button>
                                <Link href="/channel/settings">
                                    <Button variant="secondary" size="icon" className="rounded-full h-10 w-10">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <SubscribeButton
                                channelId={channel.id}
                                channelName={channel.name}
                                initialSubscribed={channel.isSubscribed}
                                initialNotify={channel.notifyOnNewVideo}
                                subscriberCount={channel.subscriberCount}
                                size="lg"
                            />
                        )}

                        {/* More Options */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full border border-border h-10 w-10"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content Tabs */}
                    <div className="flex items-center gap-2 mb-8">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                variant={activeTab === tab.key ? "default" : "outline"}
                                className={cn(
                                    "rounded-full px-6 font-medium transition-all",
                                    activeTab === tab.key
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-white dark:bg-secondary text-foreground hover:bg-gray-100 dark:hover:bg-secondary/80 border-gray-200 dark:border-border"
                                )}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-6xl mx-auto px-4 pb-20">
                    {activeTab === 'post' && (
                        <ChannelContentGrid
                            channelId={channel.id}
                            type="posts"
                            isOwner={isOwner || false}
                        />
                    )}
                    {activeTab === 'videos' && (
                        <ChannelContentGrid
                            channelId={channel.id}
                            type="videos"
                            videos={videos}
                            isLoading={isLoadingVideos}
                            isOwner={isOwner || false}
                        />
                    )}
                    {activeTab === 'file' && (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="text-lg font-medium">No files shared yet</p>
                            <p className="text-sm mt-1">Files shared by this creator will appear here</p>
                        </div>
                    )}
                    {activeTab === 'gifts' && (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="text-lg font-medium">No gifts yet</p>
                            <p className="text-sm mt-1">Support this creator by sending a gift</p>
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
            </PageContainer>
        </div>
    );
}

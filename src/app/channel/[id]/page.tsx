'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound as navigateNotFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings, Upload, Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useStore } from '@/store/useStore';
import { channelApi } from '@/lib/api/channels';
import { videoApi } from '@/lib/api/videos';
import Link from 'next/link';
import PostsFeed from '@/components/posts/PostsFeed';
import VideoUploadDialog from '@/components/video/VideoUploadDialog';
import VideoCard from '@/components/video/VideoCard';
import { VideoData } from '@/lib/api/videos';

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
}

export default function ChannelPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user, subscribe: storeSubscribe, unsubscribe: storeUnsubscribe } = useStore();

    const [channel, setChannel] = useState<ChannelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(true);

    const isOwner = user && channel && user.id === channel.ownerId;

    const handleSubscribe = async () => {
        if (!user) {
            // Redirect to login or show toast
            return;
        }

        if (!channel) return;

        setIsSubscribing(true);
        try {
            if (channel.isSubscribed) {
                await storeUnsubscribe(channel.id);
                setChannel({
                    ...channel,
                    isSubscribed: false,
                    subscriberCount: channel.subscriberCount - 1,
                });
            } else {
                await storeSubscribe(channel.id);
                setChannel({
                    ...channel,
                    isSubscribed: true,
                    subscriberCount: channel.subscriberCount + 1,
                });
            }
        } catch (err) {
            // Error already handled in store
        } finally {
            setIsSubscribing(false);
        }
    };

    const fetchChannelData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            let response;
            // If the ID starts with @, it's a handle
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
    }, [id, user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (channel?.id) {
            fetchVideos();
        }
    }, [channel?.id]);

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
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Header />
            <Sidebar />

            <PageContainer>
                {/* Banner */}
                <div className="w-full h-48 md:h-64 lg:h-80 relative overflow-hidden bg-gradient-to-br from-primary/30 to-blue-500/20">
                    {channel.bannerUrl ? (
                        <img
                            src={channel.bannerUrl}
                            alt="Channel Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Channel Header Info */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
                        <AvatarImage src={channel.avatarUrl} />
                        <AvatarFallback className="text-4xl font-bold">{channel.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 mb-2 md:mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{channel.name}</h1>
                            {channel.verified && (
                                <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium">
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                                <span className="text-foreground">{channel.handle}</span>
                                <span>•</span>
                                <span>{channel.subscriberCount.toLocaleString()} subscribers</span>
                                <span>•</span>
                                <span>{channel.videoCount} videos</span>
                            </div>
                            {channel.description && (
                                <p className="max-w-2xl line-clamp-2 text-sm md:text-base">{channel.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4 w-full md:w-auto">
                        {isOwner ? (
                            <>
                                <Link href="/channel/settings">
                                    <Button variant="secondary" className="rounded-full px-6 font-bold h-10">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage Channel
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="rounded-full px-6 font-bold bg-primary text-primary-foreground h-10"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    className={`flex-1 md:flex-none rounded-full px-8 font-bold h-10 text-base transition-all ${channel.isSubscribed
                                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        : 'bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                                        }`}
                                    onClick={handleSubscribe}
                                    disabled={isSubscribing}
                                >
                                    {isSubscribing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : channel.isSubscribed ? (
                                        'Subscribed'
                                    ) : (
                                        'Subscribe'
                                    )}
                                </Button>
                                <Button variant="secondary" size="icon" className="rounded-full h-10 w-10">
                                    <Bell className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <Tabs defaultValue="videos" className="w-full">
                        <TabsList className="bg-transparent border-b border-white/10 w-full justify-start h-auto p-0 rounded-none mb-8">
                            {['Home', 'Videos', 'Posts', 'Shorts', 'Live', 'Playlists'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab.toLowerCase()}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="videos" className="mt-0">
                            {isLoadingVideos ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : videos.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                    {videos.map((video) => (
                                        <VideoCard key={video.id} video={video} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-muted-foreground">
                                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No videos uploaded yet</p>
                                    {isOwner && (
                                        <p className="text-sm">Upload your first video to get started!</p>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="home" className="mt-0">
                            <div className="py-10 text-center text-muted-foreground">
                                Customize your channel home layout coming soon...
                            </div>
                        </TabsContent>
                        <TabsContent value="posts" className="mt-0">
                            <PostsFeed channelId={channel.id} isOwner={isOwner || false} />
                        </TabsContent>
                    </Tabs>
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

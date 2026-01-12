'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useStore } from '@/store/useStore';
import { channelApi } from '@/lib/api/channels';
import Link from 'next/link';
import VideoUploadDialog from '@/components/video/VideoUploadDialog';
import SubscribeButton from '@/components/channel/SubscribeButton';
import { formatViews } from '@/lib/formatters';
import CommunityFeed from '@/components/channel/CommunityFeed';

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

export default function ChannelPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user } = useStore();

    const [channel, setChannel] = useState<ChannelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const isOwner = user && channel && user.id === channel.ownerId;

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

    useEffect(() => {
        fetchChannelData();
    }, [id, user]);

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
                {/* Channel Header - Simple top bar */}
                <div className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-border/50">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {channel.name}
                        </h1>
                        <p className="text-primary font-medium">
                            {formatViews(channel.subscriberCount)} subscribers
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isOwner ? (
                            <Button
                                onClick={() => setIsUploadOpen(true)}
                                className="rounded-full px-6 font-bold bg-primary text-primary-foreground"
                            >
                                Upload
                            </Button>
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
                    </div>
                </div>

                {/* Community Feed */}
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <CommunityFeed
                        channelId={channel.id}
                        isOwner={isOwner || false}
                    />
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

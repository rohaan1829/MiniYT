'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Info, Loader2, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { videoApi } from '@/lib/api/videos';
import { formatViews } from '@/lib/formatters';

export default function HeroSection() {
    const [featuredVideo, setFeaturedVideo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchFeaturedVideo() {
            try {
                const response = await videoApi.getVideos({ limit: 1 });
                if (response.data && response.data.length > 0) {
                    setFeaturedVideo(response.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch featured video:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFeaturedVideo();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div className="relative w-full h-[50vh] min-h-[350px] rounded-2xl overflow-hidden mb-8 bg-secondary/50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Generic welcome banner when no videos exist
    if (!featuredVideo) {
        return (
            <div className="relative w-full h-[50vh] min-h-[350px] rounded-2xl overflow-hidden mb-8 group">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-60" />

                {/* Animated Particles/Circles */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 mb-4">
                            <Play className="w-10 h-10 text-primary fill-primary" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                        Welcome to MiniYT
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
                        Your platform for sharing and discovering amazing video content. Start exploring or upload your first video!
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/explore">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-lg font-bold h-12">
                                <Sparkles className="mr-2 h-5 w-5" /> Explore
                            </Button>
                        </Link>
                        <Link href="/channel/upload">
                            <Button size="lg" variant="outline" className="border-border/50 hover:bg-secondary/50 backdrop-blur-sm rounded-full px-8 text-lg h-12">
                                <Upload className="mr-2 h-5 w-5" /> Upload Video
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const channel = featuredVideo.user?.channel;
    const thumbnailUrl = featuredVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop';

    return (
        <div className="relative w-full h-[60vh] min-h-[400px] rounded-2xl overflow-hidden mb-8 group">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 px-8 pb-6 md:px-12 md:pb-8 max-w-2xl text-white">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider bg-primary text-white rounded-full">
                    Featured
                </span>
                <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                    {featuredVideo.title}
                </h1>
                <div className="flex items-center gap-4 mb-6 text-sm md:text-base text-gray-200">
                    <div className="flex items-center gap-2">
                        {channel?.avatarUrl && (
                            <img src={channel.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                        )}
                        <span className="font-semibold">{channel?.name || featuredVideo.user?.name || 'Unknown'}</span>
                    </div>
                    <span>•</span>
                    <span>{formatViews(featuredVideo.views)} views</span>
                </div>

                {featuredVideo.description && (
                    <p className="text-gray-300 mb-8 line-clamp-3 text-lg md:text-xl max-w-xl">
                        {featuredVideo.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-4">
                    <Link href={`/watch/${featuredVideo.id}`}>
                        <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 text-lg font-bold h-12">
                            <Play className="mr-2 h-5 w-5 fill-current" /> Play Now
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full px-8 text-lg h-12">
                        <Info className="mr-2 h-5 w-5" /> More Info
                    </Button>
                </div>
            </div>
        </div>
    );
}

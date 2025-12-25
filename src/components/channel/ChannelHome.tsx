'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Play, Eye, Clock, Calendar, ChevronLeft, ChevronRight, Users, Video, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoData } from '@/lib/api/videos';
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ChannelHomeProps {
    videos: VideoData[];
    channel: {
        id: string;
        name: string;
        handle: string;
        description?: string;
        subscriberCount: number;
        videoCount: number;
        avatarUrl?: string;
    };
    isOwner: boolean;
}

export default function ChannelHome({ videos, channel, isOwner }: ChannelHomeProps) {
    const [featuredVideo, setFeaturedVideo] = useState<VideoData | null>(null);
    const [recentVideos, setRecentVideos] = useState<VideoData[]>([]);
    const [popularVideos, setPopularVideos] = useState<VideoData[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (videos.length > 0) {
            // Featured: Most viewed video or most recent
            const sorted = [...videos].sort((a, b) => b.views - a.views);
            setFeaturedVideo(sorted[0]);

            // Recent: Last 8 videos by date
            const recent = [...videos]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 8);
            setRecentVideos(recent);

            // Popular: Top 6 by views (excluding featured)
            setPopularVideos(sorted.slice(1, 7));
        }
    }, [videos]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Total views across all videos
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);

    if (videos.length === 0) {
        return (
            <div className="py-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <Video className="w-10 h-10 text-primary/60" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No videos yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    {isOwner
                        ? "Upload your first video to start building your channel!"
                        : "This channel hasn't uploaded any videos yet. Check back later!"}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Featured Video Hero */}
            {featuredVideo && (
                <section className="relative">
                    <Link href={`/watch/${featuredVideo.id}`}>
                        <div className="relative group cursor-pointer overflow-hidden rounded-3xl">
                            {/* Background with gradient overlay */}
                            <div className="aspect-[21/9] relative">
                                <img
                                    src={featuredVideo.thumbnailUrl || '/placeholder-video.jpg'}
                                    alt={featuredVideo.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Multi-layer gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                {/* Animated glow effect on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20" />
                                </div>
                            </div>

                            {/* Content overlay */}
                            <div className="absolute inset-0 flex items-end p-8 md:p-12">
                                <div className="max-w-2xl space-y-4">
                                    {/* Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/90 text-primary-foreground rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                            <Sparkles className="w-3 h-3" />
                                            Featured
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg">
                                        {featuredVideo.title}
                                    </h2>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Eye className="w-4 h-4" />
                                            {formatViews(featuredVideo.views)} views
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {formatDuration(featuredVideo.duration || 0)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {formatTimeAgo(featuredVideo.createdAt)}
                                        </span>
                                    </div>

                                    {/* Play button */}
                                    <Button
                                        size="lg"
                                        className="mt-4 rounded-full px-8 bg-white text-black hover:bg-white/90 font-bold shadow-2xl group-hover:scale-105 transition-transform"
                                    >
                                        <Play className="w-5 h-5 mr-2 fill-current" />
                                        Watch Now
                                    </Button>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute top-8 right-8 w-32 h-32 bg-primary/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute bottom-8 right-24 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
                        </div>
                    </Link>
                </section>
            )}

            {/* Recent Uploads Carousel */}
            {recentVideos.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold">Recent Uploads</h3>
                            <p className="text-muted-foreground text-sm">Latest content from this channel</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => scroll('left')}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => scroll('right')}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {recentVideos.map((video, index) => (
                            <Link
                                key={video.id}
                                href={`/watch/${video.id}`}
                                className="flex-shrink-0 w-72 group"
                            >
                                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-secondary">
                                    <img
                                        src={video.thumbnailUrl || '/placeholder-video.jpg'}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                    {/* Duration badge */}
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs font-bold rounded">
                                        {formatDuration(video.duration || 0)}
                                    </div>

                                    {/* Play icon on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-xl">
                                            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                                        </div>
                                    </div>

                                    {/* New badge for recent */}
                                    {index === 0 && (
                                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded">
                                            New
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                    {video.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span>{formatViews(video.views)} views</span>
                                    <span>•</span>
                                    <span>{formatTimeAgo(video.createdAt)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Popular Videos Grid */}
            {popularVideos.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold">Popular Videos</h3>
                            <p className="text-muted-foreground text-sm">Most watched content</p>
                        </div>
                        <Link href={`/channel/${channel.handle}?tab=videos`}>
                            <Button variant="ghost" className="rounded-full font-bold gap-2">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularVideos.map((video, index) => (
                            <Link key={video.id} href={`/watch/${video.id}`}>
                                <div className="group relative bg-card/50 rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                                    {/* Rank badge */}
                                    <div className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white font-black text-sm border border-white/10">
                                        {index + 2}
                                    </div>

                                    <div className="aspect-video relative">
                                        <img
                                            src={video.thumbnailUrl || '/placeholder-video.jpg'}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Duration */}
                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs font-bold rounded">
                                            {formatDuration(video.duration || 0)}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="font-bold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                            {video.title}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                {formatViews(video.views)}
                                            </span>
                                            <span>{formatTimeAgo(video.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* About Section */}
            <section className="relative">
                <div className="rounded-3xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 overflow-hidden backdrop-blur-sm">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

                    <div className="relative p-8 md:p-10">
                        <h3 className="text-2xl font-bold mb-6">About {channel.name}</h3>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-secondary/50 rounded-2xl p-4 text-center group hover:bg-secondary transition-colors">
                                <Users className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                                <p className="text-2xl font-black">{formatViews(channel.subscriberCount)}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Subscribers</p>
                            </div>
                            <div className="bg-secondary/50 rounded-2xl p-4 text-center group hover:bg-secondary transition-colors">
                                <Video className="w-6 h-6 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                                <p className="text-2xl font-black">{channel.videoCount}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Videos</p>
                            </div>
                            <div className="bg-secondary/50 rounded-2xl p-4 text-center group hover:bg-secondary transition-colors">
                                <Eye className="w-6 h-6 mx-auto mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                                <p className="text-2xl font-black">{formatViews(totalViews)}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Views</p>
                            </div>
                        </div>

                        {/* Description */}
                        {channel.description && (
                            <div className="max-w-3xl">
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Description</h4>
                                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {channel.description}
                                </p>
                            </div>
                        )}

                        {/* Channel Link */}
                        <div className="mt-6 pt-6 border-t border-border/50">
                            <p className="text-sm text-muted-foreground">
                                Channel URL: <span className="text-primary font-mono">{channel.handle}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

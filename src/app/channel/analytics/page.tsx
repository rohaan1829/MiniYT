'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    BarChart3,
    TrendingUp,
    Users,
    PlayCircle,
    Clock,
    ArrowLeft,
    ChevronRight,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Eye,
    MessageCircle,
    Video,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatViews, formatTimeAgo } from '@/lib/formatters';
import {
    analyticsApi,
    ChannelOverview,
    ViewsDataPoint,
    TopVideo,
    RealtimeStats,
    ChannelVideo
} from '@/lib/api/analytics';
import Link from 'next/link';

type TabView = 'overview' | 'content' | 'audience';

export default function ChannelAnalyticsPage() {
    const { user, sidebarOpen } = useStore();
    const router = useRouter();
    const [view, setView] = useState<TabView>('overview');
    const [days, setDays] = useState<number>(30);

    // Data states
    const [overview, setOverview] = useState<ChannelOverview | null>(null);
    const [viewsData, setViewsData] = useState<ViewsDataPoint[]>([]);
    const [topVideos, setTopVideos] = useState<TopVideo[]>([]);
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
    const [allVideos, setAllVideos] = useState<ChannelVideo[]>([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
    }, []);

    const fetchAnalytics = useCallback(async () => {
        if (!user?.channel?.id) return;

        setLoading(true);
        setError(null);

        try {
            const channelId = user.channel.id;

            const [overviewRes, viewsRes, topVideosRes, realtimeRes, videosRes] = await Promise.all([
                analyticsApi.getChannelOverview(channelId),
                analyticsApi.getViewsOverTime(channelId, days),
                analyticsApi.getTopVideos(channelId, 10),
                analyticsApi.getRealtimeStats(channelId),
                analyticsApi.getChannelVideos(channelId, 50, 0)
            ]);

            if (overviewRes.success) setOverview(overviewRes.data);
            if (viewsRes.success) setViewsData(viewsRes.data);
            if (topVideosRes.success) setTopVideos(topVideosRes.data);
            if (realtimeRes.success) setRealtimeStats(realtimeRes.data);
            if (videosRes.success) setAllVideos(videosRes.data.videos);
        } catch (err: any) {
            console.error('Analytics fetch error:', err);
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [user?.channel?.id, days]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Refresh real-time stats every 30 seconds
    useEffect(() => {
        if (!user?.channel?.id) return;

        const interval = setInterval(async () => {
            try {
                const res = await analyticsApi.getRealtimeStats(user.channel!.id);
                if (res.success) setRealtimeStats(res.data);
            } catch (err) {
                console.error('Realtime stats refresh error:', err);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user?.channel?.id]);

    if (!user?.channel) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold">No Channel Found</h1>
                        <p className="text-muted-foreground">You need a channel to view analytics.</p>
                        <Button onClick={() => router.push('/channel/create')}>Create Channel</Button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const stats = overview ? [
        { label: 'Total Views', value: formatViews(overview.totalViews), icon: Eye, color: 'text-blue-500' },
        { label: 'Total Videos', value: overview.totalVideos.toString(), icon: Video, color: 'text-purple-500' },
        { label: 'Subscribers', value: formatViews(overview.subscriberCount), icon: Users, color: 'text-pink-500' },
        { label: 'Total Comments', value: formatViews(overview.totalComments), icon: MessageCircle, color: 'text-green-500' },
    ] : [];

    // Calculate max views for chart scaling
    const maxViews = Math.max(...viewsData.map(d => d.views), 1);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer>
                    <div className="max-w-[1400px] mx-auto space-y-8 px-4 py-8">
                        {/* Header Section */}
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
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Analytics Dashboard</span>
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tight">{user.channel.name}</h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Date Range Selector */}
                                <div className="flex bg-card/50 backdrop-blur-md p-1 rounded-xl border border-border/50">
                                    {[7, 30, 90].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDays(d)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                days === d
                                                    ? "bg-secondary text-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {d}d
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Selector */}
                                <div className="flex bg-card/50 backdrop-blur-md p-1 rounded-2xl border border-border/50">
                                    {['overview', 'content', 'audience'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setView(t as TabView)}
                                            className={cn(
                                                "px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                                                view === t
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <p className="text-destructive font-medium">{error}</p>
                                <Button onClick={fetchAnalytics} variant="outline">Retry</Button>
                            </div>
                        ) : (
                            <>
                                {/* Overview Tab */}
                                {view === 'overview' && (
                                    <>
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {stats.map((stat, idx) => (
                                                <Card key={idx} className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all group overflow-hidden relative">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <stat.icon size={80} />
                                                    </div>
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className={cn("p-3 rounded-2xl bg-secondary/50", stat.color)}>
                                                                <stat.icon size={20} />
                                                            </div>
                                                        </div>
                                                        <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                                                        <p className="text-3xl font-black mt-1">{stat.value}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Main Chart Section */}
                                            <Card className="lg:col-span-2 bg-card/40 backdrop-blur-sm border-border/50 overflow-hidden">
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold">Views Over Time</CardTitle>
                                                        <CardDescription>Daily views for the last {days} days</CardDescription>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-[350px] w-full flex flex-col justify-end gap-2 relative group">
                                                        <div className="absolute inset-0 flex items-end justify-between px-2 gap-1">
                                                            {viewsData.map((d, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm relative cursor-pointer group/bar"
                                                                    style={{ height: `${Math.max((d.views / maxViews) * 100, 2)}%` }}
                                                                >
                                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2 rounded-md border border-border shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                                                        {d.views.toLocaleString()} views
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="border-t border-border/50 w-full pt-4 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                                                            {viewsData.length > 0 && (
                                                                <>
                                                                    <span>{viewsData[0]?.date}</span>
                                                                    <span>{viewsData[Math.floor(viewsData.length / 2)]?.date}</span>
                                                                    <span>{viewsData[viewsData.length - 1]?.date}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Real-time Section */}
                                            <div className="space-y-6">
                                                <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
                                                    <div className="absolute -right-4 -top-4 text-primary/10 transition-transform group-hover:scale-110 duration-700">
                                                        <Activity size={120} />
                                                    </div>
                                                    <CardHeader>
                                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                            Real-time Stats
                                                        </CardTitle>
                                                        <CardDescription>Updating every 30 seconds</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4 relative z-10">
                                                            <div>
                                                                <p className="text-4xl font-black tracking-tighter">
                                                                    {realtimeStats?.subscriberCount.toLocaleString() || 0}
                                                                </p>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Total Subscribers</p>
                                                            </div>
                                                            <div className="h-px bg-primary/10 w-full" />
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-xl font-bold">{realtimeStats?.viewsLast48h.toLocaleString() || 0}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Views • Last 48h</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xl font-bold">{realtimeStats?.viewsLast60m.toLocaleString() || 0}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Views • Last 60m</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="bg-card/40 backdrop-blur-sm border-border/50 overflow-hidden">
                                                    <CardHeader>
                                                        <CardTitle className="text-lg font-bold">Quick Stats</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-sm text-muted-foreground">Avg Views / Video</span>
                                                            <span className="font-bold">{overview?.avgViewsPerVideo.toLocaleString() || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-sm text-muted-foreground">Total Videos</span>
                                                            <span className="font-bold">{overview?.totalVideos || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-sm text-muted-foreground">Total Comments</span>
                                                            <span className="font-bold">{overview?.totalComments.toLocaleString() || 0}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        {/* Top Videos Section */}
                                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-xl font-bold">Top Performing Content</CardTitle>
                                                    <CardDescription>Your most viewed videos</CardDescription>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {topVideos.length === 0 ? (
                                                    <p className="text-muted-foreground text-center py-8">No videos yet. Upload your first video!</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {topVideos.map((video) => (
                                                            <Link key={video.id} href={`/watch/${video.id}`}>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border/50 group cursor-pointer">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-24 h-14 rounded-lg overflow-hidden relative flex-shrink-0 shadow-lg bg-secondary">
                                                                            {video.thumbnailUrl ? (
                                                                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center">
                                                                                    <Video className="w-6 h-6 text-muted-foreground" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{video.title}</h4>
                                                                            <p className="text-xs text-muted-foreground">{video.publishedAt ? formatTimeAgo(video.publishedAt) : 'Not published'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-12 text-right">
                                                                        <div>
                                                                            <p className="text-sm font-black">{formatViews(video.views)}</p>
                                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Views</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black">{video.comments}</p>
                                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Comments</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {/* Content Tab */}
                                {view === 'content' && (
                                    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold">All Videos</CardTitle>
                                            <CardDescription>Manage and view stats for all your videos</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {allVideos.length === 0 ? (
                                                <p className="text-muted-foreground text-center py-8">No videos yet. Upload your first video!</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {allVideos.map((video) => (
                                                        <Link key={video.id} href={`/watch/${video.id}`}>
                                                            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border/50 group cursor-pointer">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-20 h-12 rounded-lg overflow-hidden relative flex-shrink-0 bg-secondary">
                                                                        {video.thumbnailUrl ? (
                                                                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <Video className="w-5 h-5 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold truncate group-hover:text-primary transition-colors">{video.title}</h4>
                                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                            <span className={cn(
                                                                                "px-2 py-0.5 rounded-full font-bold uppercase text-[10px]",
                                                                                video.status === 'ready' ? "bg-green-500/10 text-green-500" :
                                                                                    video.status === 'processing' ? "bg-yellow-500/10 text-yellow-500" :
                                                                                        video.status === 'failed' ? "bg-red-500/10 text-red-500" :
                                                                                            "bg-secondary text-muted-foreground"
                                                                            )}>
                                                                                {video.status}
                                                                            </span>
                                                                            <span>{formatTimeAgo(video.createdAt)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-8 text-right">
                                                                    <div>
                                                                        <p className="text-sm font-bold">{formatViews(video.views)}</p>
                                                                        <p className="text-[10px] text-muted-foreground uppercase">Views</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold">{video.comments}</p>
                                                                        <p className="text-[10px] text-muted-foreground uppercase">Comments</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Audience Tab */}
                                {view === 'audience' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold">Subscriber Overview</CardTitle>
                                                <CardDescription>Your channel's subscriber metrics</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="text-center py-8">
                                                    <p className="text-6xl font-black text-primary">{formatViews(realtimeStats?.subscriberCount || 0)}</p>
                                                    <p className="text-muted-foreground mt-2">Total Subscribers</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-secondary/50 rounded-xl p-4 text-center">
                                                        <p className="text-2xl font-bold">{formatViews(overview?.totalViews || 0)}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Total Views</p>
                                                    </div>
                                                    <div className="bg-secondary/50 rounded-xl p-4 text-center">
                                                        <p className="text-2xl font-bold">{overview?.totalVideos || 0}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Videos</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold">Engagement</CardTitle>
                                                <CardDescription>How your audience interacts with your content</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                                                        <div className="flex items-center gap-3">
                                                            <MessageCircle className="w-5 h-5 text-blue-500" />
                                                            <span>Total Comments</span>
                                                        </div>
                                                        <span className="font-bold">{overview?.totalComments.toLocaleString() || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                                                        <div className="flex items-center gap-3">
                                                            <Eye className="w-5 h-5 text-purple-500" />
                                                            <span>Avg Views per Video</span>
                                                        </div>
                                                        <span className="font-bold">{overview?.avgViewsPerVideo.toLocaleString() || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Activity className="w-5 h-5 text-green-500" />
                                                            <span>Recent Activity (48h)</span>
                                                        </div>
                                                        <span className="font-bold">{realtimeStats?.viewsLast48h.toLocaleString() || 0} views</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </PageContainer>
                <FloatingDock />
            </div>
        </ProtectedRoute>
    );
}

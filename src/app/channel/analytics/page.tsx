'use client';

import { useEffect, useState } from 'react';
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
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChannelAnalyticsPage() {
    const { user, sidebarOpen } = useStore();
    const router = useRouter();
    const [view, setView] = useState<'overview' | 'content' | 'audience'>('overview');

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
    }, []);

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

    const stats = [
        { label: 'Total Views', value: '1.2M', growth: '+12.5%', trend: 'up', icon: Eye, color: 'text-blue-500' },
        { label: 'Watch Time (hrs)', value: '45.8K', growth: '+5.2%', trend: 'up', icon: Clock, color: 'text-purple-500' },
        { label: 'Subscribers', value: user.channel.subscriberCount, growth: '+2.1%', trend: 'up', icon: Users, color: 'text-pink-500' },
        { label: 'Revenue', value: '$12,450', growth: '-1.4%', trend: 'down', icon: Activity, color: 'text-green-500' },
    ];

    const topVideos = [
        { id: 1, title: 'Mastering Next.js 14: Comprehensive Guide', views: '245K', likes: '12K', date: '2 days ago', thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&q=80' },
        { id: 2, title: 'The Future of AI in Web Development', views: '180K', likes: '8.5K', date: '5 days ago', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80' },
        { id: 3, title: 'Building a High-Performance Video Platform', views: '120K', likes: '5.2K', date: '1 week ago', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80' },
    ];

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

                            <div className="flex bg-card/50 backdrop-blur-md p-1 rounded-2xl border border-border/50">
                                {['overview', 'content', 'audience'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setView(t as any)}
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
                                            <div className={cn(
                                                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                                stat.trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {stat.growth}
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
                                        <CardTitle className="text-xl font-bold">Performance Overview</CardTitle>
                                        <CardDescription>Views and subscribers over the last 30 days</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-border/50">
                                        <Filter size={14} /> Last 30 Days
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px] w-full flex flex-col justify-end gap-2 relative group">
                                        {/* Mock Chart Visualization with SVG/Divs */}
                                        <div className="absolute inset-0 flex items-end justify-between px-2 gap-2">
                                            {[40, 60, 45, 90, 65, 80, 55, 70, 85, 95, 75, 85, 100, 80, 90, 70, 60, 75, 85, 95, 80, 70, 60, 80, 90, 100, 85, 75, 90, 80].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm relative cursor-pointer group/bar"
                                                    style={{ height: `${h}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2 rounded-md border border-border shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                                        {Math.round(h * 1200)} Views
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-border/50 w-full pt-4 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                                            <span>Week 1</span>
                                            <span>Week 2</span>
                                            <span>Week 3</span>
                                            <span>Week 4</span>
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
                                        <CardDescription>Updating every few seconds</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4 relative z-10">
                                            <div>
                                                <p className="text-4xl font-black tracking-tighter">
                                                    {user.channel.subscriberCount.toLocaleString()}
                                                </p>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Total Subscribers</p>
                                            </div>
                                            <div className="h-px bg-primary/10 w-full" />
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xl font-bold">1,452</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Views • Last 48h</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold">248</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Views • Last 60m</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card/40 backdrop-blur-sm border-border/50 overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold">Audience Location</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            { country: 'United States', percentage: 45, color: 'bg-blue-500' },
                                            { country: 'Germany', percentage: 20, color: 'bg-purple-500' },
                                            { country: 'India', percentage: 15, color: 'bg-orange-500' },
                                            { country: 'Others', percentage: 20, color: 'bg-pink-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                    <span>{item.country}</span>
                                                    <span>{item.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percentage}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Top Videos Section */}
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Top Performing Content</CardTitle>
                                    <CardDescription>Your most engaging videos this period</CardDescription>
                                </div>
                                <Button variant="ghost" className="rounded-full gap-2 hover:bg-secondary">
                                    View All Content <ChevronRight size={16} />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topVideos.map((video) => (
                                        <div key={video.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/30 transition-all border border-transparent hover:border-border/50 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-14 rounded-lg overflow-hidden relative flex-shrink-0 shadow-lg">
                                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{video.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{video.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-12 text-right">
                                                <div>
                                                    <p className="text-sm font-black">{video.views}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Views</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black">{video.likes}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Likes</p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <BarChart3 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </PageContainer>
                <FloatingDock />
            </div>
        </ProtectedRoute>
    );
}

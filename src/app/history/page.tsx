'use client';

import { History, Trash2, Clock, X, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import PageContainer from '@/components/layout/PageContainer';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { historyApi, WatchHistoryItem } from '@/lib/api/history';
import Link from 'next/link';
import Image from 'next/image';

// Helper to format duration
function formatDuration(seconds: number | null): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper to group by date
function getDateGroup(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    if (diffDays < 30) return 'This Month';
    return 'Older';
}

interface GroupedHistory {
    [key: string]: WatchHistoryItem[];
}

export default function HistoryPage() {
    const { user } = useStore();
    const [mounted, setMounted] = useState(false);
    const [historyItems, setHistoryItems] = useState<WatchHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
        setMounted(true);
    }, []);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await historyApi.getWatchHistory();
            if (response.success) {
                setHistoryItems(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to clear your entire watch history?')) return;
        try {
            await historyApi.clearWatchHistory();
            setHistoryItems([]);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    };

    const handleDeleteItem = async (videoId: string) => {
        setDeletingId(videoId);
        try {
            await historyApi.deleteHistoryItem(videoId);
            setHistoryItems(prev => prev.filter(item => item.videoId !== videoId));
        } catch (error) {
            console.error('Failed to delete history item:', error);
        } finally {
            setDeletingId(null);
        }
    };

    // Group history items by date
    const groupedHistory = useMemo<GroupedHistory>(() => {
        const groups: GroupedHistory = {};
        const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

        // Initialize groups
        order.forEach(group => {
            groups[group] = [];
        });

        // Group items
        historyItems.forEach(item => {
            const group = getDateGroup(item.viewedAt);
            if (groups[group]) {
                groups[group].push(item);
            }
        });

        // Remove empty groups
        order.forEach(group => {
            if (groups[group].length === 0) {
                delete groups[group];
            }
        });

        return groups;
    }, [historyItems]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground relative pb-32">
            <Header />
            <Sidebar />

            <PageContainer>
                <div className="max-w-6xl mx-auto space-y-8 px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <History className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Watch History</h1>
                                <p className="text-sm text-muted-foreground">
                                    {historyItems.length} video{historyItems.length !== 1 ? 's' : ''} watched
                                </p>
                            </div>
                        </div>
                        {historyItems.length > 0 && (
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-2"
                                onClick={handleClearHistory}
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear all history
                            </Button>
                        )}
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : historyItems.length === 0 ? (
                        <Card className="bg-card/40 border-dashed border-2 border-border/50">
                            <CardContent className="py-20 text-center">
                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <History className="w-10 h-10 text-primary/40" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No watch history yet</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Videos you watch will appear here so you can easily find them again.
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href="/">Browse videos</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedHistory).map(([group, items]) => (
                                <div key={group}>
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                        {group}
                                    </h2>
                                    <div className="space-y-3">
                                        {items.map((item) => {
                                            const progressPercent = item.duration > 0
                                                ? Math.min((item.watchProgress / item.duration) * 100, 100)
                                                : 0;

                                            return (
                                                <Card
                                                    key={item.id}
                                                    className="bg-card/40 border-border/50 hover:border-primary/30 transition-all group overflow-hidden"
                                                >
                                                    <CardContent className="p-0">
                                                        <div className="flex gap-4">
                                                            {/* Thumbnail with progress bar */}
                                                            <Link
                                                                href={`/watch/${item.videoId}`}
                                                                className="relative flex-shrink-0 w-40 md:w-48 aspect-video"
                                                            >
                                                                <Image
                                                                    src={item.video.thumbnailUrl || '/placeholder-video.jpg'}
                                                                    alt={item.video.title}
                                                                    fill
                                                                    className="object-cover rounded-l-lg"
                                                                />
                                                                {/* Duration badge */}
                                                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                                                    {formatDuration(item.video.duration)}
                                                                </div>
                                                                {/* Progress bar */}
                                                                {progressPercent > 0 && (
                                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                                                                        <div
                                                                            className="h-full bg-primary"
                                                                            style={{ width: `${progressPercent}%` }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Link>

                                                            {/* Info */}
                                                            <div className="flex-1 py-3 pr-4 min-w-0">
                                                                <Link href={`/watch/${item.videoId}`}>
                                                                    <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                                                                        {item.video.title}
                                                                    </h3>
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {item.video.user.name || item.video.user.username}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                                                    <span>{item.video.views.toLocaleString()} views</span>
                                                                    {progressPercent > 0 && progressPercent < 95 && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-primary">
                                                                                {Math.round(progressPercent)}% watched
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {progressPercent >= 95 && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-green-500">Completed</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Delete button */}
                                                            <div className="flex items-center pr-3">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                                    onClick={() => handleDeleteItem(item.videoId)}
                                                                    disabled={deletingId === item.videoId}
                                                                >
                                                                    {deletingId === item.videoId ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <X className="w-4 h-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PageContainer>
            <FloatingDock />
        </div>
    );
}

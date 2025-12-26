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
import {
    Inbox,
    Heart,
    MessageCircle,
    Loader2,
    Check,
    CheckCheck,
    Trash2,
    ArrowLeft,
    Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/formatters';
import { inboxApi, InboxMessage, InboxLike } from '@/lib/api/interactions';
import Link from 'next/link';

type TabView = 'messages' | 'likes';

export default function InboxPage() {
    const { user } = useStore();
    const router = useRouter();
    const [view, setView] = useState<TabView>('messages');

    // Messages state
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingMessages, setLoadingMessages] = useState(true);

    // Likes state
    const [likes, setLikes] = useState<InboxLike[]>([]);
    const [loadingLikes, setLoadingLikes] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        useStore.setState({
            sidebarOpen: true
        });
    }, []);

    const fetchMessages = useCallback(async () => {
        setLoadingMessages(true);
        try {
            const response = await inboxApi.getMessages();
            if (response.success) {
                setMessages(response.data.comments);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    const fetchLikes = useCallback(async () => {
        setLoadingLikes(true);
        try {
            const response = await inboxApi.getLikes();
            if (response.success) {
                setLikes(response.data);
            }
        } catch (err: any) {
            console.error('Failed to load likes:', err);
        } finally {
            setLoadingLikes(false);
        }
    }, []);

    useEffect(() => {
        if (user?.channel) {
            fetchMessages();
            fetchLikes();
        }
    }, [user?.channel, fetchMessages, fetchLikes]);

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await inboxApi.markAsRead(messageId);
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, isRead: true } : m
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await inboxApi.markAllAsRead();
            setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDelete = async (messageId: string) => {
        try {
            await inboxApi.deleteMessage(messageId);
            setMessages(prev => prev.filter(m => m.id !== messageId));
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    if (!user?.channel) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Inbox className="w-16 h-16 mx-auto text-muted-foreground" />
                        <h1 className="text-2xl font-bold">No Channel Found</h1>
                        <p className="text-muted-foreground">You need a channel to have an inbox.</p>
                        <Button onClick={() => router.push('/channel/create')}>Create Channel</Button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer>
                    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
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
                                    <h1 className="text-4xl font-black tracking-tight">Studio Inbox</h1>
                                </div>
                            </div>

                            {/* Studio Overview Stats */}
                            <div className="hidden lg:flex items-center gap-6 bg-card/40 backdrop-blur-md border border-border/50 p-4 rounded-2xl">
                                <div className="text-center px-4 border-r border-border/50">
                                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Unread</p>
                                    <p className="text-xl font-black text-primary">{unreadCount}</p>
                                </div>
                                <div className="text-center px-4 border-r border-border/50">
                                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Total Msgs</p>
                                    <p className="text-xl font-black">{messages.length}</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Total Likes</p>
                                    <p className="text-xl font-black text-pink-500">{likes.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tab Selector */}
                        <div className="flex bg-card/50 backdrop-blur-md p-1 rounded-2xl border border-border/50">
                            <button
                                onClick={() => setView('messages')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                    view === 'messages'
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <MessageCircle className="w-4 h-4" />
                                Messages
                                {unreadCount > 0 && (
                                    <span className="ml-1 px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setView('likes')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                    view === 'likes'
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Heart className="w-4 h-4" />
                                Likes
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-6">
                            {/* Mark All as Read */}
                            {view === 'messages' && unreadCount > 0 && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="gap-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                        Mark all as read
                                    </Button>
                                </div>
                            )}

                            {/* Messages Tab */}
                            {view === 'messages' && (
                                <div className="space-y-4">
                                    {loadingMessages ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <Card className="bg-card/40 border-dashed border-2 border-border/50">
                                            <CardContent className="py-20 text-center">
                                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <MessageCircle className="w-10 h-10 text-primary/40" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">No messages yet</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto">
                                                    When viewers send you private messages from your video pages, they'll appear here for you to manage.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        messages.map((message) => (
                                            <Card
                                                key={message.id}
                                                className={cn(
                                                    "bg-card/40 border-border/50 transition-all hover:border-primary/30",
                                                    !message.isRead && "border-l-4 border-l-primary bg-primary/5"
                                                )}
                                            >
                                                <CardContent className="p-5">
                                                    <div className="flex gap-4">
                                                        {/* Video thumbnail */}
                                                        <Link href={`/watch/${message.video.id}`}>
                                                            <div className="w-24 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0 relative group">
                                                                {message.video.thumbnailUrl ? (
                                                                    <img
                                                                        src={message.video.thumbnailUrl}
                                                                        alt={message.video.title}
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Video className="w-6 h-6 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>

                                                        <div className="flex-1 min-w-0">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="w-6 h-6">
                                                                        <AvatarImage src={message.user.image || undefined} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {message.user.name?.[0] || message.user.username[0]}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-bold text-sm">
                                                                        {message.user.name || message.user.username}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        • {formatTimeAgo(message.createdAt)}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-1">
                                                                    {!message.isRead && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={() => handleMarkAsRead(message.id)}
                                                                        >
                                                                            <Check className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => handleDelete(message.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Video title */}
                                                            <Link href={`/watch/${message.video.id}`}>
                                                                <p className="text-xs text-muted-foreground mb-1 hover:text-primary transition-colors">
                                                                    On: {message.video.title}
                                                                </p>
                                                            </Link>

                                                            {/* Message content */}
                                                            <p className="text-sm text-foreground/90">{message.content}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Likes Tab */}
                            {view === 'likes' && (
                                <div className="space-y-4">
                                    {loadingLikes ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : likes.length === 0 ? (
                                        <Card className="bg-card/40 border-dashed border-2 border-border/50">
                                            <CardContent className="py-20 text-center">
                                                <div className="w-20 h-20 bg-pink-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Heart className="w-10 h-10 text-pink-500/40" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">No likes yet</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto">
                                                    Recent likes on your videos will be highlighted here so you can see who's engaging with your content.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid gap-3">
                                            {likes.map((like) => (
                                                <Card
                                                    key={like.id}
                                                    className="bg-card/40 border-border/50 hover:border-pink-500/30 transition-all group"
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            {/* Heart icon */}
                                                            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                                                                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                                                            </div>

                                                            {/* User */}
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarImage src={like.user.image || undefined} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {like.user.name?.[0] || like.user.username[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm">
                                                                        <span className="font-bold">{like.user.name || like.user.username}</span>
                                                                        <span className="text-muted-foreground"> liked </span>
                                                                        <Link href={`/watch/${like.video.id}`} className="font-medium hover:text-primary transition-colors">
                                                                            {like.video.title}
                                                                        </Link>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Video thumbnail */}
                                                            <Link href={`/watch/${like.video.id}`}>
                                                                <div className="w-16 h-10 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                                                                    {like.video.thumbnailUrl ? (
                                                                        <img
                                                                            src={like.video.thumbnailUrl}
                                                                            alt={like.video.title}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Video className="w-4 h-4 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Link>

                                                            {/* Time */}
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {formatTimeAgo(like.createdAt)}
                                                            </span>
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

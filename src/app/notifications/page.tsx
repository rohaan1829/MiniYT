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
import {
    Bell,
    Loader2,
    CheckCheck,
    Trash2,
    ArrowLeft,
    Eye,
    MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/formatters';
import { notificationsApi, Notification } from '@/lib/api/notifications';
import Link from 'next/link';

export default function NotificationsPage() {
    const { user } = useStore();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        useStore.setState({
            sidebarOpen: true
        });
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await notificationsApi.getNotifications();
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (err: any) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationsApi.markAsRead(notificationId);
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationsApi.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'comment_viewed':
                return <Eye className="w-5 h-5 text-blue-500" />;
            case 'comment_replied':
                return <MessageCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Bell className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer>
                    <div className="max-w-3xl mx-auto space-y-8 px-4 py-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
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
                                    <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
                                    {unreadCount > 0 && (
                                        <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
                                    )}
                                </div>
                            </div>

                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Mark all as read
                                </Button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <Card className="bg-card/40 border-dashed border-2 border-border/50">
                                    <CardContent className="py-20 text-center">
                                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Bell className="w-10 h-10 text-primary/40" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            When creators view your messages or there's activity on your content, you'll see it here.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                notifications.map((notification) => (
                                    <Card
                                        key={notification.id}
                                        className={cn(
                                            "bg-card/40 border-border/50 transition-all hover:border-primary/30",
                                            !notification.isRead && "border-l-4 border-l-primary bg-primary/5"
                                        )}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{notification.message}</p>
                                                    {notification.data?.videoTitle && (
                                                        <Link
                                                            href={`/watch/${notification.data.videoId}`}
                                                            className="text-sm text-primary hover:underline block truncate mt-1"
                                                        >
                                                            → {notification.data.videoTitle}
                                                        </Link>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            title="Mark as read"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(notification.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </PageContainer>
            </div>
        </ProtectedRoute>
    );
}

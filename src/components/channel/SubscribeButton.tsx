'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, BellOff, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { channelApi } from '@/lib/api/channels';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { useToast } from '@/hooks/use-toast';

interface SubscribeButtonProps {
    channelId: string;
    channelName: string;
    initialSubscribed?: boolean;
    initialNotify?: boolean;
    subscriberCount?: number;
    onSubscribeChange?: (subscribed: boolean) => void;
    size?: 'sm' | 'default' | 'lg';
    showBellDropdown?: boolean;
    className?: string;
}

export default function SubscribeButton({
    channelId,
    channelName,
    initialSubscribed = false,
    initialNotify = true,
    subscriberCount,
    onSubscribeChange,
    size = 'default',
    showBellDropdown = true,
    className,
}: SubscribeButtonProps) {
    const { user, isAuthenticated } = useStore();
    const { toast } = useToast();
    const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
    const [notifyOnNewVideo, setNotifyOnNewVideo] = useState(initialNotify);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(subscriberCount ?? 0);

    // Sync with props
    useEffect(() => {
        setIsSubscribed(initialSubscribed);
        setNotifyOnNewVideo(initialNotify);
    }, [initialSubscribed, initialNotify]);

    useEffect(() => {
        if (subscriberCount !== undefined) {
            setCount(subscriberCount);
        }
    }, [subscriberCount]);

    // Don't show subscribe button for own channel
    const isOwnChannel = user?.channel?.id === channelId;
    if (isOwnChannel) {
        return null;
    }

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast({
                title: 'Sign in required',
                description: 'Please sign in to subscribe to channels.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            if (isSubscribed) {
                await channelApi.unsubscribe(channelId);
                setIsSubscribed(false);
                setCount((prev) => Math.max(0, prev - 1));
                toast({
                    title: 'Unsubscribed',
                    description: `You've unsubscribed from ${channelName}`,
                });
            } else {
                await channelApi.subscribe(channelId);
                setIsSubscribed(true);
                setNotifyOnNewVideo(true);
                setCount((prev) => prev + 1);
                toast({
                    title: 'Subscribed!',
                    description: `You're now subscribed to ${channelName}`,
                });
            }
            onSubscribeChange?.(!isSubscribed);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleNotifications = async (notify: boolean) => {
        if (!isSubscribed) return;

        try {
            await subscriptionsApi.toggleNotifications(channelId, notify);
            setNotifyOnNewVideo(notify);
            toast({
                title: notify ? 'Notifications on' : 'Notifications off',
                description: notify
                    ? `You'll be notified when ${channelName} posts`
                    : `You won't receive notifications from ${channelName}`,
            });
        } catch (error) {
            console.error('Failed to toggle notifications:', error);
        }
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
    };

    if (!isSubscribed) {
        return (
            <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                size={size}
                className={cn(
                    'font-bold rounded-full bg-primary hover:bg-primary/90 transition-all',
                    sizeClasses[size],
                    className
                )}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    'Subscribe'
                )}
            </Button>
        );
    }

    // Subscribed state with optional bell dropdown
    if (showBellDropdown) {
        return (
            <div className={cn('flex items-center gap-1', className)}>
                <Button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    variant="secondary"
                    size={size}
                    className={cn(
                        'font-bold rounded-l-full rounded-r-none',
                        sizeClasses[size]
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Subscribed'
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-l-none rounded-r-full border-l border-border/50 h-10 w-10"
                        >
                            {notifyOnNewVideo ? (
                                <Bell className="w-4 h-4" />
                            ) : (
                                <BellOff className="w-4 h-4 text-muted-foreground" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                            onClick={() => handleToggleNotifications(true)}
                            className={cn(
                                'flex items-center gap-2 cursor-pointer',
                                notifyOnNewVideo && 'bg-primary/10'
                            )}
                        >
                            <Bell className="w-4 h-4" />
                            <div className="flex flex-col">
                                <span className="font-medium">All notifications</span>
                                <span className="text-xs text-muted-foreground">
                                    Get notified of new videos
                                </span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleToggleNotifications(false)}
                            className={cn(
                                'flex items-center gap-2 cursor-pointer',
                                !notifyOnNewVideo && 'bg-primary/10'
                            )}
                        >
                            <BellOff className="w-4 h-4" />
                            <div className="flex flex-col">
                                <span className="font-medium">None</span>
                                <span className="text-xs text-muted-foreground">
                                    Don't receive notifications
                                </span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    // Simple subscribed button without dropdown
    return (
        <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            variant="secondary"
            size={size}
            className={cn(
                'font-bold rounded-full',
                sizeClasses[size],
                className
            )}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    Subscribed
                    <ChevronDown className="w-4 h-4 ml-1" />
                </>
            )}
        </Button>
    );
}

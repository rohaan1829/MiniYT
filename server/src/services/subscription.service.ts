import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

export const subscriptionService = {
    /**
     * Subscribe to a channel
     */
    async subscribe(userId: string, channelId: string, notifyOnNewVideo: boolean = true) {
        // Check if channel exists
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
        });

        if (!channel) {
            throw new NotFoundError('Channel not found');
        }

        // Prevent subscribing to own channel
        if (channel.ownerId === userId) {
            throw new ConflictError('Cannot subscribe to your own channel');
        }

        // Check if already subscribed
        const existing = await prisma.subscription.findUnique({
            where: {
                userId_channelId: { userId, channelId },
            },
        });

        if (existing) {
            throw new ConflictError('Already subscribed to this channel');
        }

        // Create subscription and increment subscriber count in transaction
        return await prisma.$transaction(async (tx) => {
            const subscription = await tx.subscription.create({
                data: {
                    userId,
                    channelId,
                    notifyOnNewVideo,
                },
                include: {
                    channel: {
                        select: {
                            id: true,
                            name: true,
                            handle: true,
                            avatarUrl: true,
                        },
                    },
                },
            });

            await tx.channel.update({
                where: { id: channelId },
                data: { subscriberCount: { increment: 1 } },
            });

            return subscription;
        });
    },

    /**
     * Unsubscribe from a channel
     */
    async unsubscribe(userId: string, channelId: string) {
        // Check if subscription exists
        const existing = await prisma.subscription.findUnique({
            where: {
                userId_channelId: { userId, channelId },
            },
        });

        if (!existing) {
            throw new NotFoundError('Not subscribed to this channel');
        }

        // Delete subscription and decrement subscriber count
        await prisma.$transaction(async (tx) => {
            await tx.subscription.delete({
                where: {
                    userId_channelId: { userId, channelId },
                },
            });

            await tx.channel.update({
                where: { id: channelId },
                data: { subscriberCount: { decrement: 1 } },
            });
        });
    },

    /**
     * Check if user is subscribed to a channel
     */
    async isSubscribed(userId: string, channelId: string): Promise<{ subscribed: boolean; notifyOnNewVideo?: boolean }> {
        const subscription = await prisma.subscription.findUnique({
            where: {
                userId_channelId: { userId, channelId },
            },
            select: {
                notifyOnNewVideo: true,
            },
        });

        return {
            subscribed: !!subscription,
            notifyOnNewVideo: subscription?.notifyOnNewVideo,
        };
    },

    /**
     * Get user's subscribed channels
     */
    async getSubscriptions(userId: string, limit: number = 50, offset: number = 0) {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            include: {
                channel: {
                    select: {
                        id: true,
                        handle: true,
                        name: true,
                        avatarUrl: true,
                        subscriberCount: true,
                        verified: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const total = await prisma.subscription.count({
            where: { userId },
        });

        return {
            subscriptions: subscriptions.map((sub) => ({
                ...sub.channel,
                subscribedAt: sub.createdAt,
                notifyOnNewVideo: sub.notifyOnNewVideo,
            })),
            total,
            hasMore: offset + subscriptions.length < total,
        };
    },

    /**
     * Get channel's subscribers
     */
    async getSubscribers(channelId: string, limit: number = 50, offset: number = 0) {
        const subscriptions = await prisma.subscription.findMany({
            where: { channelId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const total = await prisma.subscription.count({
            where: { channelId },
        });

        return {
            subscribers: subscriptions.map((sub) => ({
                ...sub.user,
                subscribedAt: sub.createdAt,
            })),
            total,
            hasMore: offset + subscriptions.length < total,
        };
    },

    /**
     * Get subscription feed - videos from subscribed channels
     */
    async getSubscriptionFeed(userId: string, limit: number = 20, offset: number = 0) {
        // Get all subscribed channel IDs
        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            select: { channelId: true },
        });

        if (subscriptions.length === 0) {
            return {
                videos: [],
                total: 0,
                hasMore: false,
            };
        }

        const channelIds = subscriptions.map((sub) => sub.channelId);

        // Get channel owner IDs from channels
        const channels = await prisma.channel.findMany({
            where: { id: { in: channelIds } },
            select: { ownerId: true },
        });

        const ownerIds = channels.map((ch) => ch.ownerId);

        // Get videos from those users
        const videos = await prisma.video.findMany({
            where: {
                userId: { in: ownerIds },
                status: 'ready',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        image: true,
                        channel: {
                            select: {
                                id: true,
                                handle: true,
                                name: true,
                                avatarUrl: true,
                                verified: true,
                            },
                        },
                    },
                },
            },
            orderBy: { publishedAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const total = await prisma.video.count({
            where: {
                userId: { in: ownerIds },
                status: 'ready',
            },
        });

        return {
            videos,
            total,
            hasMore: offset + videos.length < total,
        };
    },

    /**
     * Update notification preference for a subscription
     */
    async updateNotificationPreference(userId: string, channelId: string, notifyOnNewVideo: boolean) {
        const existing = await prisma.subscription.findUnique({
            where: {
                userId_channelId: { userId, channelId },
            },
        });

        if (!existing) {
            throw new NotFoundError('Not subscribed to this channel');
        }

        return await prisma.subscription.update({
            where: {
                userId_channelId: { userId, channelId },
            },
            data: { notifyOnNewVideo },
        });
    },

    /**
     * Notify all subscribers of a channel about a new video
     */
    async notifySubscribers(channelId: string, videoId: string) {
        // Get the channel and video info
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { name: true, handle: true },
        });

        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { title: true },
        });

        if (!channel || !video) {
            return;
        }

        // Get all subscribers with notifications enabled
        const subscribers = await prisma.subscription.findMany({
            where: {
                channelId,
                notifyOnNewVideo: true,
            },
            select: { userId: true },
        });

        // Create notifications for each subscriber
        const notifications = subscribers.map((sub) => ({
            userId: sub.userId,
            type: 'new_video',
            message: `${channel.name} uploaded: ${video.title}`,
            data: {
                channelId,
                channelHandle: channel.handle,
                channelName: channel.name,
                videoId,
                videoTitle: video.title,
            },
        }));

        // Batch create notifications
        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications.map((n) => ({
                    userId: n.userId,
                    type: n.type,
                    message: n.message,
                    data: n.data,
                })),
            });
        }

        return { notified: notifications.length };
    },
};

export default subscriptionService;

import prisma from '../config/database';

interface ChannelOverview {
    totalViews: number;
    totalVideos: number;
    subscriberCount: number;
    totalComments: number;
    avgViewsPerVideo: number;
}

interface ViewsDataPoint {
    date: string;
    views: number;
}

interface TopVideo {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    views: number;
    likes: number;
    comments: number;
    publishedAt: Date | null;
}

interface RealtimeStats {
    subscriberCount: number;
    viewsLast48h: number;
    viewsLast60m: number;
}

export class AnalyticsService {
    /**
     * Get channel overview statistics
     */
    async getChannelOverview(channelId: string): Promise<ChannelOverview> {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: {
                ownerId: true,
                subscriberCount: true
            }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        // Get videos for this channel owner
        const videos = await prisma.video.findMany({
            where: {
                userId: channel.ownerId,
                status: 'ready'
            },
            select: {
                id: true,
                views: true,
                _count: {
                    select: { comments: true }
                }
            }
        });

        const totalViews = videos.reduce((sum: number, v) => sum + v.views, 0);
        const totalComments = videos.reduce((sum: number, v) => sum + v._count.comments, 0);

        return {
            totalViews,
            totalVideos: videos.length,
            subscriberCount: channel.subscriberCount,
            totalComments,
            avgViewsPerVideo: videos.length > 0 ? Math.round(totalViews / videos.length) : 0
        };
    }

    /**
     * Get views over time for chart visualization
     * Returns daily view counts for the specified period
     */
    async getViewsOverTime(channelId: string, days: number = 30): Promise<ViewsDataPoint[]> {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { ownerId: true }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        // Get all videos for this channel
        const videos = await prisma.video.findMany({
            where: {
                userId: channel.ownerId,
                status: 'ready'
            },
            select: { id: true }
        });

        const videoIds = videos.map(v => v.id);

        if (videoIds.length === 0) {
            return this.generateEmptyDataPoints(days);
        }

        // Get view snapshots for these videos
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const snapshots = await prisma.viewSnapshot.findMany({
            where: {
                videoId: { in: videoIds },
                timestamp: { gte: startDate }
            },
            orderBy: { timestamp: 'asc' }
        });

        // Group snapshots by day and calculate daily view gains
        const dailyViews = new Map<string, number>();
        const videoLastViews = new Map<string, number>();

        for (const snapshot of snapshots) {
            const dateKey = snapshot.timestamp.toISOString().split('T')[0];
            const lastViews = videoLastViews.get(snapshot.videoId) || 0;
            const viewGain = Math.max(0, snapshot.views - lastViews);

            if (lastViews > 0) {
                dailyViews.set(dateKey, (dailyViews.get(dateKey) || 0) + viewGain);
            }

            videoLastViews.set(snapshot.videoId, snapshot.views);
        }

        // Generate data points for all days
        const result: ViewsDataPoint[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            result.push({
                date: dateKey,
                views: dailyViews.get(dateKey) || 0
            });
        }

        return result;
    }

    /**
     * Get top performing videos for the channel
     */
    async getTopVideos(channelId: string, limit: number = 10): Promise<TopVideo[]> {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { ownerId: true }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        const videos = await prisma.video.findMany({
            where: {
                userId: channel.ownerId,
                status: 'ready'
            },
            include: {
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { views: 'desc' },
            take: limit
        });

        return videos.map(v => ({
            id: v.id,
            title: v.title,
            thumbnailUrl: v.thumbnailUrl,
            views: v.views,
            likes: 0, // No likes model yet
            comments: v._count.comments,
            publishedAt: v.publishedAt
        }));
    }

    /**
     * Get real-time statistics
     */
    async getRealtimeStats(channelId: string): Promise<RealtimeStats> {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { ownerId: true, subscriberCount: true }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        const videos = await prisma.video.findMany({
            where: {
                userId: channel.ownerId,
                status: 'ready'
            },
            select: { id: true }
        });

        const videoIds = videos.map(v => v.id);

        // Calculate views in last 48 hours
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);

        let viewsLast48h = 0;
        let viewsLast60m = 0;

        if (videoIds.length > 0) {
            // Get earliest snapshot from 48h ago
            const snapshots48h = await prisma.viewSnapshot.findMany({
                where: {
                    videoId: { in: videoIds },
                    timestamp: { gte: fortyEightHoursAgo }
                },
                orderBy: { timestamp: 'asc' }
            });

            // Get current total views
            const currentVideos = await prisma.video.findMany({
                where: { id: { in: videoIds } },
                select: { id: true, views: true }
            });

            const currentTotal = currentVideos.reduce((sum: number, v) => sum + v.views, 0);

            // Find earliest snapshot to compare
            const earliestSnapshots = new Map<string, number>();
            for (const s of snapshots48h) {
                if (!earliestSnapshots.has(s.videoId)) {
                    earliestSnapshots.set(s.videoId, s.views);
                }
            }
            const earliestTotal = Array.from(earliestSnapshots.values()).reduce((sum: number, v) => sum + v, 0);
            viewsLast48h = Math.max(0, currentTotal - earliestTotal);

            // Similar calculation for 60 minutes
            const snapshots60m = await prisma.viewSnapshot.findMany({
                where: {
                    videoId: { in: videoIds },
                    timestamp: { gte: sixtyMinutesAgo }
                },
                orderBy: { timestamp: 'asc' }
            });

            const earliest60m = new Map<string, number>();
            for (const s of snapshots60m) {
                if (!earliest60m.has(s.videoId)) {
                    earliest60m.set(s.videoId, s.views);
                }
            }
            const earliest60mTotal = Array.from(earliest60m.values()).reduce((sum: number, v) => sum + v, 0);
            viewsLast60m = Math.max(0, currentTotal - earliest60mTotal);
        }

        return {
            subscriberCount: channel.subscriberCount,
            viewsLast48h,
            viewsLast60m
        };
    }

    /**
     * Get all videos for the channel with their stats (for Content tab)
     */
    async getChannelVideos(channelId: string, limit: number = 50, offset: number = 0) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { ownerId: true }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        const videos = await prisma.video.findMany({
            where: {
                userId: channel.ownerId
            },
            include: {
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        const total = await prisma.video.count({
            where: { userId: channel.ownerId }
        });

        return {
            videos: videos.map(v => ({
                id: v.id,
                title: v.title,
                thumbnailUrl: v.thumbnailUrl,
                views: v.views,
                comments: v._count.comments,
                status: v.status,
                publishedAt: v.publishedAt,
                createdAt: v.createdAt
            })),
            total,
            hasMore: offset + videos.length < total
        };
    }

    private generateEmptyDataPoints(days: number): ViewsDataPoint[] {
        const result: ViewsDataPoint[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            result.push({
                date: date.toISOString().split('T')[0],
                views: 0
            });
        }
        return result;
    }
}

export const analyticsService = new AnalyticsService();

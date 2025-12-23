import prisma from '../config/database';

interface TrendingOptions {
    category?: string;
    timeRange?: 'now' | 'today' | 'week';
    limit?: number;
    offset?: number;
}

interface TrendingScoreComponents {
    viewVelocity: number;
    totalViews: number;
    freshnessScore: number;
    engagementRate: number;
}

export class TrendingService {
    /**
     * Calculate trending score for a video based on multiple signals
     * Formula: (viewVelocity * 0.4) + (totalViews * 0.25) + (freshnessScore * 0.2) + (engagementRate * 0.15)
     */
    async calculateTrendingScore(videoId: string): Promise<number> {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            include: {
                comments: true,
                viewSnapshots: {
                    orderBy: { timestamp: 'desc' },
                    take: 50, // Last 50 snapshots for velocity calculation
                },
            },
        });

        if (!video || video.status !== 'ready') {
            return 0;
        }

        const components = await this.calculateScoreComponents(video);

        const score =
            components.viewVelocity * 0.4 +
            components.totalViews * 0.25 +
            components.freshnessScore * 0.2 +
            components.engagementRate * 0.15;

        // Update video with new trending score
        await prisma.video.update({
            where: { id: videoId },
            data: {
                trendingScore: score,
                lastTrendingUpdate: new Date(),
            },
        });

        return score;
    }

    /**
     * Calculate individual score components
     */
    private async calculateScoreComponents(video: any): Promise<TrendingScoreComponents> {
        const now = Date.now();
        const publishedAt = video.publishedAt || video.createdAt;
        const ageInHours = (now - publishedAt.getTime()) / (1000 * 60 * 60);

        // 1. View Velocity (views per hour in last 24h)
        const viewVelocity = await this.getViewVelocity(video.id, video.viewSnapshots);

        // 2. Total Views (normalized, log scale to prevent dominance)
        const totalViews = Math.log10(Math.max(video.views, 1)) / 10; // 0-1 range

        // 3. Freshness Score (exponential decay, newer = higher)
        // Videos lose 50% score every 48 hours
        const halfLifeHours = 48;
        const freshnessScore = Math.exp(-(ageInHours / halfLifeHours) * Math.log(2));

        // 4. Engagement Rate (comments / views ratio)
        const engagementRate = video.views > 0
            ? Math.min(video.comments.length / video.views, 0.1) * 10 // normalize to 0-1
            : 0;

        return {
            viewVelocity: Math.min(viewVelocity, 1), // cap at 1
            totalViews,
            freshnessScore,
            engagementRate,
        };
    }

    /**
     * Calculate view velocity (views gained per hour) based on snapshots
     */
    private async getViewVelocity(_videoId: string, snapshots: any[]): Promise<number> {
        if (snapshots.length < 2) {
            return 0;
        }

        const now = Date.now();
        const last24Hours = now - 24 * 60 * 60 * 1000;

        // Filter snapshots from last 24 hours
        const recentSnapshots = snapshots.filter(
            (s) => s.timestamp.getTime() >= last24Hours
        );

        if (recentSnapshots.length < 2) {
            // Fallback: use any two snapshots
            const latest = snapshots[0];
            const oldest = snapshots[snapshots.length - 1];
            const viewsGained = latest.views - oldest.views;
            const timeSpanHours =
                (latest.timestamp.getTime() - oldest.timestamp.getTime()) / (1000 * 60 * 60);

            return timeSpanHours > 0 ? viewsGained / timeSpanHours / 10000 : 0; // normalize
        }

        const latest = recentSnapshots[0];
        const oldest = recentSnapshots[recentSnapshots.length - 1];
        const viewsGained = latest.views - oldest.views;
        const timeSpanHours =
            (latest.timestamp.getTime() - oldest.timestamp.getTime()) / (1000 * 60 * 60);

        // Normalize to 0-1 range (assume 10k views/hour is max)
        return timeSpanHours > 0 ? viewsGained / timeSpanHours / 10000 : 0;
    }

    /**
     * Get trending videos with filters
     */
    async getTrendingVideos(options: TrendingOptions = {}) {
        const { category, timeRange = 'today', limit = 50, offset = 0 } = options;

        const where: any = {
            status: 'ready',
            trendingScore: { gt: 0 },
        };

        if (category && category !== 'all') {
            where.category = category;
        }

        // Time range filter
        if (timeRange === 'now') {
            // Last 4 hours
            where.publishedAt = {
                gte: new Date(Date.now() - 4 * 60 * 60 * 1000),
            };
        } else if (timeRange === 'today') {
            // Last 24 hours
            where.publishedAt = {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            };
        } else if (timeRange === 'week') {
            // Last 7 days
            where.publishedAt = {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            };
        }

        const videos = await prisma.video.findMany({
            where,
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
                comments: {
                    select: { id: true }, // Just count
                },
            },
            orderBy: {
                trendingScore: 'desc',
            },
            take: limit,
            skip: offset,
        });

        return videos;
    }

    /**
     * Get available categories with trending videos
     */
    async getTrendingCategories(): Promise<string[]> {
        const videos = await prisma.video.findMany({
            where: {
                status: 'ready',
                category: { not: null },
                trendingScore: { gt: 0 },
            },
            select: {
                category: true,
            },
            distinct: ['category'],
        });

        return videos.map((v) => v.category).filter((cat): cat is string => cat !== null);
    }

    /**
     * Update trending scores for all eligible videos
     * Called by background worker
     */
    async updateAllTrendingScores(): Promise<void> {
        const videos = await prisma.video.findMany({
            where: {
                status: 'ready',
            },
            select: {
                id: true,
            },
        });

        // Process in batches of 100
        const batchSize = 100;
        for (let i = 0; i < videos.length; i += batchSize) {
            const batch = videos.slice(i, i + batchSize);
            await Promise.all(
                batch.map((video) => this.calculateTrendingScore(video.id))
            );
        }
    }

    /**
     * Take a snapshot of current view counts for all videos
     * Called periodically by background worker
     */
    async takeViewSnapshots(): Promise<void> {
        const videos = await prisma.video.findMany({
            where: {
                status: 'ready',
            },
            select: {
                id: true,
                views: true,
            },
        });

        // Bulk create snapshots
        await prisma.viewSnapshot.createMany({
            data: videos.map((video) => ({
                videoId: video.id,
                views: video.views,
            })),
        });

        // Clean up old snapshots (keep only last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        await prisma.viewSnapshot.deleteMany({
            where: {
                timestamp: {
                    lt: sevenDaysAgo,
                },
            },
        });
    }
}

export const trendingService = new TrendingService();

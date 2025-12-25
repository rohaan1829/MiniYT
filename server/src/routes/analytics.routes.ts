import { Router } from 'express';
import { analyticsService } from '../services/analytics.service';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Middleware to verify channel ownership
const verifyChannelOwnership = async (req: any, res: any, next: any) => {
    const { channelId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        select: { ownerId: true }
    });

    if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    if (channel.ownerId !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    next();
};

// GET /api/analytics/channel/:channelId/overview
router.get('/channel/:channelId/overview', authenticate, verifyChannelOwnership, async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const overview = await analyticsService.getChannelOverview(channelId);
        return res.json({ success: true, data: overview });
    } catch (error) {
        logger.error('Analytics overview error:', error);
        return next(error);
    }
});

// GET /api/analytics/channel/:channelId/views
router.get('/channel/:channelId/views', authenticate, verifyChannelOwnership, async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const { days = '30' } = req.query;
        const viewsData = await analyticsService.getViewsOverTime(channelId, parseInt(days as string));
        return res.json({ success: true, data: viewsData });
    } catch (error) {
        logger.error('Analytics views error:', error);
        return next(error);
    }
});

// GET /api/analytics/channel/:channelId/top-videos
router.get('/channel/:channelId/top-videos', authenticate, verifyChannelOwnership, async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const { limit = '10' } = req.query;
        const topVideos = await analyticsService.getTopVideos(channelId, parseInt(limit as string));
        return res.json({ success: true, data: topVideos });
    } catch (error) {
        logger.error('Analytics top videos error:', error);
        return next(error);
    }
});

// GET /api/analytics/channel/:channelId/realtime
router.get('/channel/:channelId/realtime', authenticate, verifyChannelOwnership, async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const realtimeStats = await analyticsService.getRealtimeStats(channelId);
        return res.json({ success: true, data: realtimeStats });
    } catch (error) {
        logger.error('Analytics realtime error:', error);
        return next(error);
    }
});

// GET /api/analytics/channel/:channelId/videos
router.get('/channel/:channelId/videos', authenticate, verifyChannelOwnership, async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const { limit = '50', offset = '0' } = req.query;
        const videos = await analyticsService.getChannelVideos(
            channelId,
            parseInt(limit as string),
            parseInt(offset as string)
        );
        return res.json({ success: true, data: videos });
    } catch (error) {
        logger.error('Analytics videos error:', error);
        return next(error);
    }
});

export default router;

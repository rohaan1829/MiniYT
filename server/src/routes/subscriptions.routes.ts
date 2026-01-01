import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import subscriptionService from '../services/subscription.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/subscriptions
 * Get user's subscribed channels
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const userId = req.user!.id;
        const { limit = '50', offset = '0' } = req.query;

        const result = await subscriptionService.getSubscriptions(
            userId,
            parseInt(limit as string),
            parseInt(offset as string)
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Get subscriptions error:', error);
        return next(error);
    }
});

/**
 * GET /api/subscriptions/feed
 * Get video feed from subscribed channels
 */
router.get('/feed', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const userId = req.user!.id;
        const { limit = '20', offset = '0' } = req.query;

        const result = await subscriptionService.getSubscriptionFeed(
            userId,
            parseInt(limit as string),
            parseInt(offset as string)
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        logger.error('Get subscription feed error:', error);
        return next(error);
    }
});

/**
 * PATCH /api/subscriptions/:channelId/notify
 * Toggle notification preference for a subscription
 */
router.patch('/:channelId/notify', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const userId = req.user!.id;
        const { channelId } = req.params;
        const { notify } = req.body;

        if (typeof notify !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'notify must be a boolean',
            });
        }

        const subscription = await subscriptionService.updateNotificationPreference(
            userId,
            channelId,
            notify
        );

        return res.json({
            success: true,
            message: notify ? 'Notifications enabled' : 'Notifications disabled',
            data: { notifyOnNewVideo: subscription.notifyOnNewVideo },
        });
    } catch (error) {
        logger.error('Update notification preference error:', error);
        return next(error);
    }
});

/**
 * GET /api/subscriptions/:channelId/status
 * Check subscription status for a channel
 */
router.get('/:channelId/status', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const userId = req.user!.id;
        const { channelId } = req.params;

        const status = await subscriptionService.isSubscribed(userId, channelId);

        return res.json({
            success: true,
            data: status,
        });
    } catch (error) {
        logger.error('Check subscription status error:', error);
        return next(error);
    }
});

export default router;

import { Router } from 'express';
import { notificationsService } from '../services/notifications.service';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/notifications - Get user's notifications
router.get('/', authenticate, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { limit = '50', offset = '0' } = req.query;

        const result = await notificationsService.getNotifications(
            userId,
            parseInt(limit as string),
            parseInt(offset as string)
        );
        return res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Get notifications error:', error);
        return next(error);
    }
});

// GET /api/notifications/count - Get unread notification count
router.get('/count', authenticate, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const count = await notificationsService.getUnreadCount(userId);
        return res.json({ success: true, data: { unreadCount: count } });
    } catch (error) {
        logger.error('Get notification count error:', error);
        return next(error);
    }
});

// PATCH /api/notifications/:id/read - Mark a notification as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user!.id;

        const success = await notificationsService.markAsRead(notificationId, userId);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.json({ success: true });
    } catch (error) {
        logger.error('Mark notification as read error:', error);
        return next(error);
    }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const count = await notificationsService.markAllAsRead(userId);
        return res.json({ success: true, data: { markedAsRead: count } });
    } catch (error) {
        logger.error('Mark all notifications as read error:', error);
        return next(error);
    }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user!.id;

        const success = await notificationsService.deleteNotification(notificationId, userId);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.json({ success: true });
    } catch (error) {
        logger.error('Delete notification error:', error);
        return next(error);
    }
});

export default router;

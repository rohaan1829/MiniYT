import { Router } from 'express';
import { commentsService } from '../services/comments.service';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/videos/:id/comments - Send a private message to creator
router.post('/:id/comments', authenticate, async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const userId = req.user!.id;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        if (content.length > 2000) {
            return res.status(400).json({ success: false, message: 'Comment too long (max 2000 characters)' });
        }

        const comment = await commentsService.createComment(videoId, userId, content.trim());
        return res.status(201).json({ success: true, data: comment });
    } catch (error) {
        logger.error('Create comment error:', error);
        return next(error);
    }
});

// GET /api/videos/:id/comments/count - Get comment count for a video
router.get('/:id/comments/count', async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const count = await commentsService.getCommentCount(videoId);
        return res.json({ success: true, data: { count } });
    } catch (error) {
        logger.error('Get comment count error:', error);
        return next(error);
    }
});

// GET /api/videos/:id/comments/public - Get public comments for a video
router.get('/:id/comments/public', async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const { limit = '50', offset = '0' } = req.query;

        const result = await commentsService.getPublicComments(
            videoId,
            parseInt(limit as string),
            parseInt(offset as string)
        );
        return res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Get public comments error:', error);
        return next(error);
    }
});

export default router;

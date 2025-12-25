import { Router } from 'express';
import { likesService } from '../services/likes.service';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/videos/:id/like - Toggle like (requires auth)
router.post('/:id/like', authenticate, async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const userId = req.user!.id;

        const result = await likesService.toggleLike(videoId, userId);
        return res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Toggle like error:', error);
        return next(error);
    }
});

// GET /api/videos/:id/like - Get like status
router.get('/:id/like', optionalAuthenticate, async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const userId = req.user?.id;

        const likeCount = await likesService.getLikeCount(videoId);
        const liked = userId ? await likesService.getLikeStatus(videoId, userId) : false;

        return res.json({
            success: true,
            data: { liked, likeCount }
        });
    } catch (error) {
        logger.error('Get like status error:', error);
        return next(error);
    }
});

export default router;

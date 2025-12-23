import { Router } from 'express';
import { trendingService } from '../services/trending.service';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = Router();

const getTrendingSchema = z.object({
    category: z.string().optional(),
    timeRange: z.enum(['now', 'today', 'week']).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
});

// GET /api/trending - Get trending videos
router.get('/', async (req, res, next) => {
    try {
        const params = getTrendingSchema.parse(req.query);

        const videos = await trendingService.getTrendingVideos({
            category: params.category,
            timeRange: params.timeRange || 'today',
            limit: params.limit || 50,
            offset: params.offset || 0,
        });

        const categories = await trendingService.getTrendingCategories();

        return res.json({
            success: true,
            data: {
                videos,
                categories: ['all', ...categories],
                updatedAt: new Date(),
            },
        });
    } catch (error) {
        logger.error('Trending fetch error:', error);
        return next(error);
    }
});

// GET /api/trending/categories - Get available categories
router.get('/categories', async (_req, res, next) => {
    try {
        const categories = await trendingService.getTrendingCategories();
        return res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        return next(error);
    }
});

export default router;

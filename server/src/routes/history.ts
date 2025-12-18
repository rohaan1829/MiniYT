import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// Get watch history
router.get('/watch', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const history = await prisma.watchHistory.findMany({
            where: { userId: req.user!.id },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        duration: true,
                        views: true,
                        createdAt: true,
                        user: {
                            select: {
                                name: true,
                                username: true,
                            }
                        }
                    }
                }
            },
            orderBy: { viewedAt: 'desc' },
        });

        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
});

// Clear watch history
router.delete('/watch', authenticate, async (req: AuthRequest, res, next) => {
    try {
        await prisma.watchHistory.deleteMany({
            where: { userId: req.user!.id },
        });
        res.json({ success: true, message: 'Watch history cleared' });
    } catch (error) {
        next(error);
    }
});

// Get search history
router.get('/search', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const history = await prisma.searchHistory.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
});

// Clear search history
router.delete('/search', authenticate, async (req: AuthRequest, res, next) => {
    try {
        await prisma.searchHistory.deleteMany({
            where: { userId: req.user!.id },
        });
        res.json({ success: true, message: 'Search history cleared' });
    } catch (error) {
        next(error);
    }
});

export default router;

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
                                channel: {
                                    select: {
                                        id: true,
                                        handle: true
                                    }
                                }
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

// Record/update watch progress (upsert)
router.post('/watch', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { videoId, watchProgress, duration } = req.body;
        const userId = req.user!.id;

        if (!videoId) {
            return res.status(400).json({ success: false, message: 'Video ID is required' });
        }

        const history = await prisma.watchHistory.upsert({
            where: {
                userId_videoId: { userId, videoId }
            },
            update: {
                watchProgress: watchProgress || 0,
                duration: duration || 0,
                viewedAt: new Date()
            },
            create: {
                userId,
                videoId,
                watchProgress: watchProgress || 0,
                duration: duration || 0
            }
        });

        return res.json({ success: true, data: history });
    } catch (error) {
        return next(error);
    }
});

// Get watch progress for a specific video
router.get('/watch/:videoId/progress', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { videoId } = req.params;
        const userId = req.user!.id;

        const history = await prisma.watchHistory.findUnique({
            where: {
                userId_videoId: { userId, videoId }
            },
            select: {
                watchProgress: true,
                duration: true,
                viewedAt: true
            }
        });

        if (!history) {
            return res.json({ success: true, data: { watchProgress: 0, duration: 0 } });
        }

        return res.json({ success: true, data: history });
    } catch (error) {
        return next(error);
    }
});

// Delete single history item
router.delete('/watch/:videoId', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { videoId } = req.params;
        const userId = req.user!.id;

        await prisma.watchHistory.delete({
            where: {
                userId_videoId: { userId, videoId }
            }
        });

        return res.json({ success: true, message: 'History item deleted' });
    } catch (error: any) {
        // If not found, still return success
        if (error.code === 'P2025') {
            return res.json({ success: true, message: 'History item not found' });
        }
        return next(error);
    }
});

// Clear all watch history
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

import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { prisma } from '../config/database';

const router = Router();

const createPlaylistSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().optional(),
    }),
});

const addVideoSchema = z.object({
    body: z.object({
        videoId: z.string(),
    }),
});

// Get all playlists for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const playlists = await (prisma as any).playlist.findMany({
            where: { userId: req.user!.id },
            include: {
                _count: {
                    select: { videos: true }
                }
            }
        });
        res.json({ success: true, data: playlists });
    } catch (error) {
        next(error);
    }
});

// Create playlist
router.post('/', authenticate, validate(createPlaylistSchema), async (req: AuthRequest, res, next) => {
    try {
        const { name, description, isPublic } = req.body;
        const playlist = await (prisma as any).playlist.create({
            data: {
                name,
                description,
                isPublic: isPublic ?? false,
                userId: req.user!.id,
            }
        });
        res.status(201).json({ success: true, data: playlist });
    } catch (error) {
        next(error);
    }
});

// Add video to playlist
router.post('/:id/videos', authenticate, validate(addVideoSchema), async (req: AuthRequest, res, next) => {
    try {
        const { videoId } = req.body;
        const playlistId = req.params.id;

        // Verify ownership
        const playlist = await (prisma as any).playlist.findFirst({
            where: { id: playlistId, userId: req.user!.id }
        });

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        const playlistVideo = await (prisma as any).playlistVideo.create({
            data: {
                playlistId,
                videoId,
            }
        });

        return res.json({ success: true, data: playlistVideo });
    } catch (error) {
        return next(error);
    }
});

// Remove video from playlist
router.delete('/:id/videos/:videoId', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id: playlistId, videoId } = req.params;

        // Verify ownership
        const playlist = await (prisma as any).playlist.findFirst({
            where: { id: playlistId, userId: req.user!.id }
        });

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        await (prisma as any).playlistVideo.delete({
            where: {
                playlistId_videoId: {
                    playlistId,
                    videoId,
                }
            }
        });

        return res.json({ success: true, message: 'Video removed from playlist' });
    } catch (error) {
        return next(error);
    }
});

export default router;

import { Router } from 'express';
import { videoService } from '../services/video.service';
import { storageProvider } from '../services/storage.service';
import { videoQueue, VIDEO_JOBS } from '../config/queue';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = Router();

const createVideoSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(5000).optional(),
});

// GET /api/videos - Get feed
router.get('/', async (req, res, next) => {
    try {
        const { category, userId, channelId, limit, offset } = req.query;
        const videos = await videoService.getVideos({
            category: category as string,
            userId: userId as string,
            channelId: channelId as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined,
        });
        return res.json({ success: true, data: videos });
    } catch (error) {
        return next(error);
    }
});

// GET /api/videos/:id - Get single video
router.get('/:id', async (req, res, next) => {
    try {
        const video = await videoService.getVideoById(req.params.id);
        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // Background increment views
        videoService.incrementViews(req.params.id).catch(err => logger.error('View increment error:', err));

        return res.json({ success: true, data: video });
    } catch (error) {
        return next(error);
    }
});

// POST /api/videos/upload - Upload video and thumbnail
router.post('/upload', authenticate, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const videoFile = files['video']?.[0];
        const thumbnailFile = files['thumbnail']?.[0];

        if (!videoFile) {
            return res.status(400).json({ success: false, message: 'Video file is required' });
        }

        const data = createVideoSchema.parse(req.body);

        // Upload to S3 using storageProvider. Keep local file for background processing.
        const videoKey = await storageProvider.uploadFile(videoFile, {
            folder: 'videos',
            keepLocalFile: true
        });
        let thumbnailKey: string | undefined;

        if (thumbnailFile) {
            thumbnailKey = await storageProvider.uploadFile(thumbnailFile, { folder: 'thumbnails' });
        }

        const video = await videoService.createVideo({
            userId: req.user!.id,
            title: data.title,
            description: data.description,
            videoUrl: storageProvider.getPublicUrl(videoKey),
            thumbnailUrl: thumbnailKey ? storageProvider.getPublicUrl(thumbnailKey) : undefined,
            duration: 0, // Placeholder
        });

        // Update video status to 'processing' (it's 'ready' by default currently)
        await videoService.updateVideo(video.id, req.user!.id, { status: 'processing' });

        // Add to processing queue with absolute path
        await videoQueue.add(VIDEO_JOBS.PROCESS_VIDEO, {
            videoId: video.id,
            userId: req.user!.id,
            videoUrl: video.videoUrl,
            tempPath: videoFile.path
        });

        return res.status(201).json({ success: true, data: video });
    } catch (error) {
        return next(error);
    }
});

// PATCH /api/videos/:id - Update metadata
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const updated = await videoService.updateVideo(req.params.id, req.user!.id, req.body);
        return res.json({ success: true, data: updated });
    } catch (error) {
        return next(error);
    }
});

// DELETE /api/videos/:id - Delete video
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        await videoService.deleteVideo(req.params.id, req.user!.id);
        return res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        return next(error);
    }
});

export default router;

import { Router } from 'express';
import { videoService } from '../services/video.service';
import { storageProvider } from '../services/storage.service';
import { videoQueue, VIDEO_JOBS } from '../config/queue';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { z } from 'zod';
import { logger } from '../utils/logger';
import subscriptionService from '../services/subscription.service';

const router = Router();

const createVideoSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(5000).optional(),
    category: z.string().optional(),
});

// GET /api/videos - Get feed
router.get('/', optionalAuthenticate, async (req: AuthRequest, res, next) => {
    try {
        const { category, userId, channelId, limit, offset } = req.query;
        const videos = await videoService.getVideos({
            category: category as string,
            userId: userId as string,
            channelId: channelId as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined,
        });

        // Add subscription status if user is logged in
        if (req.user) {
            const enrichedVideos = await Promise.all(videos.map(async (v: any) => {
                if (!v.user?.channel) return v;

                const status = await subscriptionService.isSubscribed(req.user!.id, v.user.channel.id);
                return {
                    ...v,
                    user: {
                        ...v.user,
                        channel: {
                            ...v.user.channel,
                            isSubscribed: status.subscribed,
                            notifyOnNewVideo: status.notifyOnNewVideo || false
                        }
                    }
                };
            }));

            return res.json({ success: true, data: enrichedVideos });
        }

        return res.json({ success: true, data: videos });
    } catch (error) {
        return next(error);
    }
});

import { likesService } from '../services/likes.service';

// GET /api/videos/:id - Get single video
router.get('/:id', optionalAuthenticate, async (req: AuthRequest, res, next) => {
    try {
        const video = await videoService.getVideoById(req.params.id);
        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // Background increment views - ONLY if the video is ready/published
        if (video.status === 'ready') {
            videoService.incrementViews(req.params.id).catch(err => logger.error('View increment error:', err));
        }

        // Add subscription status if user is logged in
        let isSubscribed = false;
        let notifyOnNewVideo = false;
        let isLiked = false;

        if (req.user) {
            if (video.user?.channel) {
                const status = await subscriptionService.isSubscribed(req.user.id, video.user.channel.id);
                isSubscribed = status.subscribed;
                notifyOnNewVideo = status.notifyOnNewVideo || false;
            }
            isLiked = await likesService.getLikeStatus(video.id, req.user.id);
        }

        const data = {
            ...video,
            isLiked,
            user: {
                ...video.user,
                channel: video.user?.channel ? {
                    ...video.user.channel,
                    isSubscribed,
                    notifyOnNewVideo
                } : null
            }
        };

        return res.json({ success: true, data });
    } catch (error) {
        return next(error);
    }
});

// POST /api/videos/presigned-url - Get a presigned S3 URL for direct upload
router.post('/presigned-url', authenticate, async (req, res, next) => {
    try {
        const { fileName, contentType, folder } = req.body;

        if (!fileName || !contentType) {
            return res.status(400).json({ success: false, message: 'fileName and contentType are required' });
        }

        const data = await storageProvider.getPresignedUploadUrl(fileName, contentType, folder);

        return res.json({
            success: true,
            data: {
                uploadUrl: data.url,
                key: data.key,
                publicUrl: storageProvider.getPublicUrl(data.key)
            }
        });
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
            filename: videoFile.filename,
            keepLocalFile: true
        });

        let thumbnailUrl = undefined;
        if (thumbnailFile) {
            const thumbKey = await storageProvider.uploadFile(thumbnailFile, {
                folder: 'thumbnails',
                filename: thumbnailFile.filename
            });
            thumbnailUrl = storageProvider.getPublicUrl(thumbKey);
        }

        const videoUrl = storageProvider.getPublicUrl(videoKey);

        const video = await videoService.createVideo({
            userId: (req as any).user.id,
            title: data.title,
            description: data.description,
            category: data.category,
            videoUrl: videoUrl,
            thumbnailUrl: thumbnailUrl,
            duration: 0,
        });

        // Trigger background processing - don't await
        import('../services/video-processor.service').then(({ videoProcessorService }) => {
            videoProcessorService.processVideo(video.id).catch(err =>
                logger.error(`Failed to start processing for video ${video.id}:`, err)
            );
        });

        // Update video status to 'processing'
        await videoService.updateVideo(video.id, (req as any).user.id, { status: 'processing' });

        // Add to processing queue with absolute path
        await videoQueue.add(VIDEO_JOBS.PROCESS_VIDEO, {
            videoId: video.id,
            userId: (req as any).user.id,
            videoUrl: videoUrl,
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

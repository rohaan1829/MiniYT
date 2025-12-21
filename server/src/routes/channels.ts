import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validator';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { storageProvider } from '../services/storage.service';
import * as channelService from '../services/channel.service';
import { BadRequestError } from '../utils/errors';
import prisma from '../config/database';

const router = Router();

const createChannelSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Channel name must be at least 3 characters').max(50),
        handle: z.string()
            .min(3)
            .max(30)
            .regex(/^@[a-zA-Z0-9_]+$/, 'Handle must start with @ and contain only letters, numbers, and underscores'),
        description: z.string().max(1000).optional(),
    }),
});

const updateChannelSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(50).optional(),
        description: z.string().max(1000).optional(),
        bannerUrl: z.string().url().optional(),
        avatarUrl: z.string().url().optional(),
    }),
});

// Create channel (authenticated users only)
router.post(
    '/',
    authenticate,
    validate(createChannelSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const channel = await channelService.createChannel(req.user!.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Channel created successfully',
                data: channel,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get channel by ID
router.get('/:channelId', optionalAuthenticate, async (req: AuthRequest, res, next) => {
    try {
        const channel = await channelService.getChannel(req.params.channelId, req.user?.id);
        res.json({ success: true, data: channel });
    } catch (error) {
        next(error);
    }
});

// Get channel by handle
router.get('/handle/:handle', optionalAuthenticate, async (req: AuthRequest, res, next) => {
    try {
        const channel = await channelService.getChannelByHandle(req.params.handle, req.user?.id);
        res.json({ success: true, data: channel });
    } catch (error) {
        next(error);
    }
});

// Subscribe to a channel
router.post('/:channelId/subscribe', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const subscription = await channelService.subscribe(req.user!.id, req.params.channelId);
        res.json({
            success: true,
            message: 'Subscribed successfully',
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
});

// Unsubscribe from a channel
router.delete('/:channelId/subscribe', authenticate, async (req: AuthRequest, res, next) => {
    try {
        await channelService.unsubscribe(req.user!.id, req.params.channelId);
        res.json({
            success: true,
            message: 'Unsubscribed successfully',
        });
    } catch (error) {
        next(error);
    }
});

// Update channel (owner only)
router.patch(
    '/:channelId',
    authenticate,
    validate(updateChannelSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const channel = await channelService.updateChannel(
                req.params.channelId,
                req.user!.id,
                req.body
            );
            res.json({
                success: true,
                message: 'Channel updated successfully',
                data: channel,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Upload channel avatar
router.post(
    '/:channelId/avatar',
    authenticate,
    upload.single('avatar'),
    async (req: AuthRequest, res, next) => {
        try {
            if (!req.file) {
                throw new BadRequestError('No file uploaded');
            }

            const channelId = req.params.channelId;

            // Upload to S3
            const key = await storageProvider.uploadFile(req.file, { folder: 'channels' });
            const imageUrl = storageProvider.getPublicUrl(key);

            // Verify ownership via service or directly
            const channel = await (prisma as any).channel.findUnique({
                where: { id: channelId },
            });

            if (!channel || channel.ownerId !== req.user!.id) {
                // Should probably delete the uploaded file from S3 if ownership fails
                await storageProvider.deleteFile(key);
                throw new BadRequestError('Channel not found or you are not the owner');
            }

            const updated = await (prisma as any).channel.update({
                where: { id: channelId },
                data: { avatarUrl: imageUrl },
            });

            res.json({
                success: true,
                message: 'Channel avatar updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Upload channel banner
router.post(
    '/:channelId/banner',
    authenticate,
    upload.single('banner'),
    async (req: AuthRequest, res, next) => {
        try {
            if (!req.file) {
                throw new BadRequestError('No file uploaded');
            }

            const channelId = req.params.channelId;

            // Upload to S3
            const key = await storageProvider.uploadFile(req.file, { folder: 'banners' });
            const imageUrl = storageProvider.getPublicUrl(key);

            // Verify ownership
            const channel = await (prisma as any).channel.findUnique({
                where: { id: channelId },
            });

            if (!channel || channel.ownerId !== req.user!.id) {
                await storageProvider.deleteFile(key);
                throw new BadRequestError('Channel not found or you are not the owner');
            }

            const updated = await (prisma as any).channel.update({
                where: { id: channelId },
                data: { bannerUrl: imageUrl },
            });

            res.json({
                success: true,
                message: 'Channel banner updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Delete channel (owner only)
router.delete('/:channelId', authenticate, async (req: AuthRequest, res, next) => {
    try {
        await channelService.deleteChannel(req.params.channelId, req.user!.id);
        res.json({
            success: true,
            message: 'Channel deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;

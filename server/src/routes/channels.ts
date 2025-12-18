import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import * as channelService from '../services/channel.service';

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
    async (req, res, next) => {
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
router.get('/:channelId', async (req, res, next) => {
    try {
        const channel = await channelService.getChannel(req.params.channelId);
        res.json({ success: true, data: channel });
    } catch (error) {
        next(error);
    }
});

// Get channel by handle
router.get('/handle/:handle', async (req, res, next) => {
    try {
        const channel = await channelService.getChannelByHandle(req.params.handle);
        res.json({ success: true, data: channel });
    } catch (error) {
        next(error);
    }
});

// Update channel (owner only)
router.patch(
    '/:channelId',
    authenticate,
    validate(updateChannelSchema),
    async (req, res, next) => {
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

// Delete channel (owner only)
router.delete('/:channelId', authenticate, async (req, res, next) => {
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

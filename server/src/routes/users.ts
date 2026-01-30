import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { upload } from '../middleware/upload';
import * as authService from '../services/auth.service';
import prisma from '../config/database';
import { BadRequestError } from '../utils/errors';

const router = Router();

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores').optional(),
        email: z.string().email().optional(),
        bio: z.string().max(500).optional(),
        settings: z.record(z.any()).optional(),
    }),
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const profile = await authService.getProfile(req.user!.id);
        res.json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
});

// Update user profile
router.patch(
    '/me',
    authenticate,
    validate(updateProfileSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const { name, username, email, bio, settings } = req.body;
            const userId = req.user!.id;

            // Check if username is already taken
            if (username) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        username,
                        NOT: { id: userId }
                    }
                });
                if (existingUser) {
                    throw new BadRequestError('Username is already taken');
                }
            }

            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(name && { name }),
                    ...(username && { username }),
                    ...(email && { email }),
                    ...(bio !== undefined && { bio }),
                    ...(settings && { settings }),
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    image: true,
                    bio: true,
                    settings: true,
                },
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Upload profile picture
router.post(
    '/me/avatar',
    authenticate,
    upload.single('avatar'),
    async (req: AuthRequest, res, next) => {
        try {
            if (!req.file) {
                throw new BadRequestError('No file uploaded');
            }

            const userId = req.user!.id;
            const imageUrl = `/uploads/profiles/${req.file.filename}`;

            const updated = await prisma.user.update({
                where: { id: userId },
                data: { image: imageUrl },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    image: true,
                },
            });

            res.json({
                success: true,
                message: 'Profile picture updated successfully',
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;

import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import { config } from '../config/env';
import * as authService from '../services/auth.service';

const router = Router();

const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format'),
        username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required'),
    }),
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', authenticate, async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user!.id) as any;
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                channelId: user.channel?.id || null,
            },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    ...user,
                    avatar: user.image,
                },
                token
            },
        });
    } catch (error) {
        next(error);
    }
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
    }),
});

router.patch('/change-password', authenticate, validate(changePasswordSchema), async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user!.id, currentPassword, newPassword);
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;

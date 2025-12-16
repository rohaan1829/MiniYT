import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validator';
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

export default router;

import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';

const router = Router();

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

export default router;

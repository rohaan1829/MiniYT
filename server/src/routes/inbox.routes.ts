import { Router } from 'express';
import { commentsService } from '../services/comments.service';
import { likesService } from '../services/likes.service';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import prisma from '../config/database';

const router = Router();

// GET /api/inbox - Get creator's inbox (messages and likes)
router.get('/', authenticate, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { limit = '50', offset = '0' } = req.query;

        // Get user's channel
        const channel = await prisma.channel.findUnique({
            where: { ownerId: userId },
            select: { id: true }
        });

        if (!channel) {
            return res.status(404).json({ success: false, message: 'No channel found for this user' });
        }

        const inbox = await commentsService.getCreatorInbox(channel.id, parseInt(limit as string), parseInt(offset as string));
        return res.json({ success: true, data: inbox });
    } catch (error) {
        logger.error('Get inbox error:', error);
        return next(error);
    }
});

// GET /api/inbox/likes - Get recent likes on creator's videos
router.get('/likes', authenticate, async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { limit = '50', offset = '0' } = req.query;

        // Get user's channel
        const channel = await prisma.channel.findUnique({
            where: { ownerId: userId },
            select: { id: true }
        });

        if (!channel) {
            return res.status(404).json({ success: false, message: 'No channel found for this user' });
        }

        const likes = await likesService.getChannelLikes(channel.id, parseInt(limit as string), parseInt(offset as string));
        return res.json({ success: true, data: likes });
    } catch (error) {
        logger.error('Get inbox likes error:', error);
        return next(error);
    }
});

// PATCH /api/inbox/:id/read - Mark a message as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.user!.id;

        const success = await commentsService.markAsRead(commentId, userId);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Message not found or not authorized' });
        }

        return res.json({ success: true });
    } catch (error) {
        logger.error('Mark as read error:', error);
        return next(error);
    }
});

// PATCH /api/inbox/read-all - Mark all messages as read
router.patch('/read-all', authenticate, async (req, res, next) => {
    try {
        const userId = req.user!.id;

        // Get user's channel
        const channel = await prisma.channel.findUnique({
            where: { ownerId: userId },
            select: { id: true }
        });

        if (!channel) {
            return res.status(404).json({ success: false, message: 'No channel found for this user' });
        }

        const count = await commentsService.markAllAsRead(channel.id);
        return res.json({ success: true, data: { markedAsRead: count } });
    } catch (error) {
        logger.error('Mark all as read error:', error);
        return next(error);
    }
});

// DELETE /api/inbox/:id - Delete a message
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.user!.id;

        const success = await commentsService.deleteComment(commentId, userId);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Message not found or not authorized' });
        }

        return res.json({ success: true });
    } catch (error) {
        logger.error('Delete message error:', error);
        return next(error);
    }
});

// POST /api/inbox/:id/reply - Creator replies to a message (makes it public)
router.post('/:id/reply', authenticate, async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const creatorUserId = req.user!.id;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Reply content is required' });
        }

        if (content.length > 2000) {
            return res.status(400).json({ success: false, message: 'Reply too long (max 2000 characters)' });
        }

        const reply = await commentsService.replyToComment(commentId, creatorUserId, content.trim());
        return res.status(201).json({ success: true, data: reply });
    } catch (error: any) {
        logger.error('Reply to message error:', error);
        if (error.message === 'Comment not found') {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        if (error.message === 'Only the video owner can reply') {
            return res.status(403).json({ success: false, message: 'Not authorized to reply' });
        }
        return next(error);
    }
});

export default router;

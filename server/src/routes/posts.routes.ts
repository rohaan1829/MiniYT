import { Router } from 'express';
import { postService } from '../services/post.service';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { z } from 'zod';
import { PostType, PostVisibility } from '@prisma/client';

const router = Router();

const createPostSchema = z.object({
    channelId: z.string(),
    type: z.nativeEnum(PostType),
    content: z.string().optional(),
    visibility: z.nativeEnum(PostVisibility).optional(),
});

const updatePostSchema = z.object({
    content: z.string().optional(),
    visibility: z.nativeEnum(PostVisibility).optional(),
});

// GET /api/posts/channel/:channelId - Get posts for a channel
router.get('/channel/:channelId', async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const posts = await postService.getChannelPosts(
            req.params.channelId,
            limit ? parseInt(limit as string) : undefined,
            offset ? parseInt(offset as string) : undefined
        );
        return res.json({ success: true, data: posts });
    } catch (error) {
        return next(error);
    }
});

// GET /api/posts/:id - Get single post
router.get('/:id', async (req, res, next) => {
    try {
        const post = await postService.getPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        return res.json({ success: true, data: post });
    } catch (error) {
        return next(error);
    }
});

// POST /api/posts - Create post
router.post('/', authenticate, upload.single('media'), async (req, res, next) => {
    try {
        const validatedData = createPostSchema.parse(req.body);
        const mediaUrl = req.file ? `/uploads/posts/${req.file.filename}` : undefined;

        const post = await postService.createPost({
            userId: (req as any).user.id,
            channelId: validatedData.channelId,
            type: validatedData.type,
            content: validatedData.content,
            visibility: validatedData.visibility,
            mediaUrl,
        });

        return res.status(201).json({ success: true, data: post });
    } catch (error) {
        return next(error);
    }
});

// PATCH /api/posts/:id - Update post
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const validatedData = updatePostSchema.parse(req.body);
        const post = await postService.updatePost(
            req.params.id,
            (req as any).user.id,
            {
                content: validatedData.content,
                visibility: validatedData.visibility,
            }
        );
        return res.json({ success: true, data: post });
    } catch (error) {
        return next(error);
    }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        await postService.deletePost(req.params.id, (req as any).user.id);
        return res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        return next(error);
    }
});

// POST /api/posts/:id/like - Toggle like
router.post('/:id/like', authenticate, async (req, res, next) => {
    try {
        const result = await postService.toggleLike(req.params.id, (req as any).user.id);
        return res.json({ success: true, data: result });
    } catch (error) {
        return next(error);
    }
});

// POST /api/posts/:id/comments - Add comment
router.post('/:id/comments', authenticate, async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }
        const comment = await postService.addComment(
            req.params.id,
            (req as any).user.id,
            content
        );
        return res.status(201).json({ success: true, data: comment });
    } catch (error) {
        return next(error);
    }
});

// GET /api/posts/:id/comments - Get comments
router.get('/:id/comments', async (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const comments = await postService.getComments(
            req.params.id,
            limit ? parseInt(limit as string) : undefined,
            offset ? parseInt(offset as string) : undefined
        );
        return res.json({ success: true, data: comments });
    } catch (error) {
        return next(error);
    }
});

// DELETE /api/posts/:id/comments/:commentId - Delete comment
router.delete('/:postId/comments/:commentId', authenticate, async (req, res, next) => {
    try {
        await postService.deleteComment(req.params.commentId, (req as any).user.id);
        return res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        return next(error);
    }
});

export default router;

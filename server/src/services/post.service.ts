import prisma from '../config/database';
import { PostType, PostVisibility } from '@prisma/client';

export interface CreatePostData {
    userId: string;
    channelId: string;
    type: PostType;
    content?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    visibility?: PostVisibility;
}

export interface UpdatePostData {
    content?: string;
    visibility?: PostVisibility;
}

export class PostService {
    async createPost(data: CreatePostData) {
        return await prisma.post.create({
            data,
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
                channel: true,
            },
        });
    }

    async getChannelPosts(channelId: string, limit = 20, offset = 0) {
        // Query to get posts
        const posts = await prisma.post.findMany({
            where: {
                channelId,
            },
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likedBy: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: offset,
        });

        // Filter by visibility if needed
        // For now, let's keep it simple and return all, 
        // but in a real app we'd check subscription status here if visibility is SUBSCRIBERS_ONLY
        return posts;
    }

    async getPostById(id: string) {
        return await prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
                comments: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        likedBy: true,
                    },
                },
            },
        });
    }

    async updatePost(id: string, userId: string, data: UpdatePostData) {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post || post.userId !== userId) {
            throw new Error('Unauthorized or post not found');
        }

        return await prisma.post.update({
            where: { id },
            data,
        });
    }

    async deletePost(id: string, userId: string) {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post || post.userId !== userId) {
            throw new Error('Unauthorized or post not found');
        }

        return await prisma.post.delete({
            where: { id },
        });
    }

    async toggleLike(postId: string, userId: string) {
        const existingLike = await prisma.postLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });

        if (existingLike) {
            await prisma.postLike.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId,
                    },
                },
            });

            await prisma.post.update({
                where: { id: postId },
                data: { likes: { decrement: 1 } },
            });

            return { liked: false };
        } else {
            await prisma.postLike.create({
                data: {
                    postId,
                    userId,
                },
            });

            await prisma.post.update({
                where: { id: postId },
                data: { likes: { increment: 1 } },
            });

            return { liked: true };
        }
    }

    async addComment(postId: string, userId: string, content: string) {
        return await prisma.postComment.create({
            data: {
                postId,
                userId,
                content,
            },
            include: {
                user: true,
            },
        });
    }

    async getComments(postId: string, limit = 20, offset = 0) {
        return await prisma.postComment.findMany({
            where: { postId },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: offset,
        });
    }

    async deleteComment(commentId: string, userId: string) {
        const comment = await prisma.postComment.findUnique({
            where: { id: commentId },
            include: { post: true }
        });

        if (!comment) {
            throw new Error('Comment not found');
        }

        // Allow comment owner OR post owner to delete
        if (comment.userId !== userId && comment.post.userId !== userId) {
            throw new Error('Unauthorized');
        }

        return await prisma.postComment.delete({
            where: { id: commentId },
        });
    }
}

export const postService = new PostService();

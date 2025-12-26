import prisma from '../config/database';

interface CommentWithUser {
    id: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    user: {
        id: string;
        username: string;
        name: string | null;
        image: string | null;
    };
    video: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
    };
}

export class CommentsService {
    /**
     * Create a private comment/message on a video
     * This message goes to the creator's inbox, not public
     */
    async createComment(videoId: string, userId: string, content: string): Promise<CommentWithUser> {
        const comment = await prisma.comment.create({
            data: {
                videoId,
                userId,
                content,
                isRead: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        image: true
                    }
                },
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true
                    }
                }
            }
        });

        return comment;
    }

    /**
     * Get all messages for a channel owner's inbox
     */
    async getCreatorInbox(channelId: string, limit: number = 50, offset: number = 0) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { ownerId: true }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        // Get comments on videos owned by this channel
        const comments = await prisma.comment.findMany({
            where: {
                video: {
                    userId: channel.ownerId
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        image: true
                    }
                },
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        // Get unread count
        const unreadCount = await prisma.comment.count({
            where: {
                video: {
                    userId: channel.ownerId
                },
                isRead: false
            }
        });

        const total = await prisma.comment.count({
            where: {
                video: {
                    userId: channel.ownerId
                }
            }
        });

        return { comments, unreadCount, total };
    }

    /**
     * Mark a comment as read
     */
    async markAsRead(commentId: string, ownerId: string): Promise<boolean> {
        // Verify the comment belongs to a video owned by this user
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                video: {
                    select: { userId: true }
                }
            }
        });

        if (!comment || comment.video.userId !== ownerId) {
            return false;
        }

        await prisma.comment.update({
            where: { id: commentId },
            data: { isRead: true }
        });

        return true;
    }

    /**
     * Mark all comments as read for a channel
     */
    async markAllAsRead(channelId: string): Promise<number> {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { ownerId: true }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        const result = await prisma.comment.updateMany({
            where: {
                video: {
                    userId: channel.ownerId
                },
                isRead: false
            },
            data: { isRead: true }
        });

        return result.count;
    }

    /**
     * Delete a comment
     */
    async deleteComment(commentId: string, userId: string): Promise<boolean> {
        // User can delete their own comment, or channel owner can delete comments on their videos
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                video: {
                    select: { userId: true }
                }
            }
        });

        if (!comment) {
            return false;
        }

        // Check if user is the comment author or video owner
        if (comment.userId !== userId && comment.video.userId !== userId) {
            return false;
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });

        return true;
    }

    /**
     * Get comment count for a video (for display purposes)
     */
    async getCommentCount(videoId: string): Promise<number> {
        return await prisma.comment.count({
            where: { videoId }
        });
    }

    /**
     * Creator replies to a private message, making the thread public
     */
    async replyToComment(commentId: string, creatorUserId: string, replyContent: string) {
        // Find the original comment and verify creator owns the video
        const originalComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                video: {
                    select: { id: true, userId: true }
                }
            }
        });

        if (!originalComment) {
            throw new Error('Comment not found');
        }

        if (originalComment.video.userId !== creatorUserId) {
            throw new Error('Only the video owner can reply');
        }

        // Use a transaction to:
        // 1. Mark the original comment as public and read
        // 2. Create the reply as public
        const [updatedOriginal, reply] = await prisma.$transaction([
            prisma.comment.update({
                where: { id: commentId },
                data: { isPublic: true, isRead: true }
            }),
            prisma.comment.create({
                data: {
                    videoId: originalComment.videoId,
                    userId: creatorUserId,
                    content: replyContent,
                    isPublic: true,
                    isRead: true,
                    parentId: commentId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true
                        }
                    }
                }
            })
        ]);

        return reply;
    }

    /**
     * Get public comments for a video (displayed on the watch page)
     * Returns top-level public comments with their replies
     */
    async getPublicComments(videoId: string, limit: number = 50, offset: number = 0) {
        // Fetch top-level public comments (those without parentId)
        const comments = await prisma.comment.findMany({
            where: {
                videoId,
                isPublic: true,
                parentId: null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        image: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                image: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        // Get the video owner ID to identify creator replies
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { userId: true }
        });

        return {
            comments,
            creatorId: video?.userId || null
        };
    }
}

export const commentsService = new CommentsService();

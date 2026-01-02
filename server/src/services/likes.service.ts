import prisma from '../config/database';

interface InteractionResult {
    liked: boolean;
    disliked: boolean;
    likeCount: number;
    dislikeCount: number;
}

export class LikesService {
    /**
     * Toggle like on a video - if disliked, removes dislike first
     */
    async toggleLike(videoId: string, userId: string): Promise<InteractionResult> {
        const existingLike = await prisma.videoLike.findUnique({
            where: { videoId_userId: { videoId, userId } }
        });

        const existingDislike = await prisma.videoDislike.findUnique({
            where: { videoId_userId: { videoId, userId } }
        });

        if (existingLike) {
            // Unlike
            await prisma.$transaction([
                prisma.videoLike.delete({ where: { id: existingLike.id } }),
                prisma.video.update({
                    where: { id: videoId },
                    data: { likeCount: { decrement: 1 } }
                })
            ]);
        } else {
            // Like
            const updates: any[] = [
                prisma.videoLike.create({ data: { videoId, userId } }),
                prisma.video.update({
                    where: { id: videoId },
                    data: { likeCount: { increment: 1 } }
                })
            ];

            // Remove dislike if it exists
            if (existingDislike) {
                updates.push(prisma.videoDislike.delete({ where: { id: existingDislike.id } }));
                updates.push(prisma.video.update({
                    where: { id: videoId },
                    data: { dislikeCount: { decrement: 1 } }
                }));
            }

            await prisma.$transaction(updates);
        }

        return this.getInteractionStatus(videoId, userId);
    }

    /**
     * Toggle dislike on a video - if liked, removes like first
     */
    async toggleDislike(videoId: string, userId: string): Promise<InteractionResult> {
        const existingLike = await prisma.videoLike.findUnique({
            where: { videoId_userId: { videoId, userId } }
        });

        const existingDislike = await prisma.videoDislike.findUnique({
            where: { videoId_userId: { videoId, userId } }
        });

        if (existingDislike) {
            // Un-dislike
            await prisma.$transaction([
                prisma.videoDislike.delete({ where: { id: existingDislike.id } }),
                prisma.video.update({
                    where: { id: videoId },
                    data: { dislikeCount: { decrement: 1 } }
                })
            ]);
        } else {
            // Dislike
            const updates: any[] = [
                prisma.videoDislike.create({ data: { videoId, userId } }),
                prisma.video.update({
                    where: { id: videoId },
                    data: { dislikeCount: { increment: 1 } }
                })
            ];

            // Remove like if it exists
            if (existingLike) {
                updates.push(prisma.videoLike.delete({ where: { id: existingLike.id } }));
                updates.push(prisma.video.update({
                    where: { id: videoId },
                    data: { likeCount: { decrement: 1 } }
                }));
            }

            await prisma.$transaction(updates);
        }

        return this.getInteractionStatus(videoId, userId);
    }

    /**
     * Get full interaction status for a video
     */
    async getInteractionStatus(videoId: string, userId?: string): Promise<InteractionResult> {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { likeCount: true, dislikeCount: true }
        });

        let liked = false;
        let disliked = false;

        if (userId) {
            const [like, dislike] = await Promise.all([
                prisma.videoLike.findUnique({ where: { videoId_userId: { videoId, userId } } }),
                prisma.videoDislike.findUnique({ where: { videoId_userId: { videoId, userId } } })
            ]);
            liked = !!like;
            disliked = !!dislike;
        }

        return {
            liked,
            disliked,
            likeCount: video?.likeCount || 0,
            dislikeCount: video?.dislikeCount || 0
        };
    }

    /**
     * Check if user has liked a video
     */
    async getLikeStatus(videoId: string, userId: string): Promise<boolean> {
        const like = await prisma.videoLike.findUnique({
            where: { videoId_userId: { videoId, userId } }
        });
        return !!like;
    }

    /**
     * Get like count for a video
     */
    async getLikeCount(videoId: string): Promise<number> {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { likeCount: true }
        });
        return video?.likeCount || 0;
    }

    /**
     * Get recent likes for a channel owner's videos (for inbox)
     */
    async getChannelLikes(channelId: string, limit: number = 50, offset: number = 0) {
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            select: { ownerId: true }
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        // Get likes on videos owned by this channel
        const likes = await prisma.videoLike.findMany({
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

        return likes;
    }
    /**
     * Get videos liked by a user
     */
    async getLikedVideos(userId: string, limit: number = 50, offset: number = 0) {
        const likedEntries = await prisma.videoLike.findMany({
            where: { userId },
            include: {
                video: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                image: true,
                                channel: {
                                    select: {
                                        id: true,
                                        name: true,
                                        handle: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        return likedEntries.map(entry => entry.video);
    }
}

export const likesService = new LikesService();

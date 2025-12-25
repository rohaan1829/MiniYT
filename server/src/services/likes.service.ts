import prisma from '../config/database';

interface LikeResult {
    liked: boolean;
    likeCount: number;
}

export class LikesService {
    /**
     * Toggle like on a video - if liked, unlike; if not liked, like
     */
    async toggleLike(videoId: string, userId: string): Promise<LikeResult> {
        const existingLike = await prisma.videoLike.findUnique({
            where: {
                videoId_userId: { videoId, userId }
            }
        });

        if (existingLike) {
            // Unlike: delete the like and decrement count
            await prisma.$transaction([
                prisma.videoLike.delete({
                    where: { id: existingLike.id }
                }),
                prisma.video.update({
                    where: { id: videoId },
                    data: { likeCount: { decrement: 1 } }
                })
            ]);

            const video = await prisma.video.findUnique({
                where: { id: videoId },
                select: { likeCount: true }
            });

            return { liked: false, likeCount: video?.likeCount || 0 };
        } else {
            // Like: create the like and increment count
            await prisma.$transaction([
                prisma.videoLike.create({
                    data: { videoId, userId }
                }),
                prisma.video.update({
                    where: { id: videoId },
                    data: { likeCount: { increment: 1 } }
                })
            ]);

            const video = await prisma.video.findUnique({
                where: { id: videoId },
                select: { likeCount: true }
            });

            return { liked: true, likeCount: video?.likeCount || 0 };
        }
    }

    /**
     * Check if user has liked a video
     */
    async getLikeStatus(videoId: string, userId: string): Promise<boolean> {
        const like = await prisma.videoLike.findUnique({
            where: {
                videoId_userId: { videoId, userId }
            }
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
}

export const likesService = new LikesService();

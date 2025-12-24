import prisma from '../config/database';

export interface CreateVideoData {
    userId: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    duration?: number;
    status?: string;
    category?: string;
}

export interface UpdateVideoData {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    status?: string;
    category?: string;
}

export class VideoService {
    async createVideo(data: CreateVideoData) {
        return await prisma.video.create({
            data: {
                ...data,
                status: 'pending',
            },
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
            },
        });
    }

    async getVideos(params: { category?: string; userId?: string; channelId?: string; limit?: number; offset?: number; includeProcessing?: boolean } = {}) {
        const { limit = 20, offset = 0, userId, channelId, category, includeProcessing = false } = params;

        const where: any = {};

        if (userId) {
            where.userId = userId;
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        if (channelId) {
            where.user = {
                channel: {
                    id: channelId
                }
            };
        }

        if (!includeProcessing && !userId && !channelId) {
            where.status = 'ready';
        }

        return await prisma.video.findMany({
            where,
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
            },
            take: limit,
            skip: offset,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getVideoById(id: string) {
        return await prisma.video.findUnique({
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
            },
        });
    }

    async updateVideo(id: string, userId: string, data: UpdateVideoData) {
        // Verify ownership
        const video = await prisma.video.findUnique({ where: { id } });
        if (!video || video.userId !== userId) {
            throw new Error('Unauthorized or video not found');
        }

        return await prisma.video.update({
            where: { id },
            data,
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
            },
        });
    }

    async deleteVideo(id: string, userId: string) {
        // Verify ownership
        const video = await prisma.video.findUnique({ where: { id } });
        if (!video || video.userId !== userId) {
            throw new Error('Unauthorized or video not found');
        }

        return await prisma.video.delete({
            where: { id },
        });
    }

    async incrementViews(id: string) {
        return await prisma.video.update({
            where: { id },
            data: {
                views: { increment: 1 },
            },
        });
    }
}

export const videoService = new VideoService();

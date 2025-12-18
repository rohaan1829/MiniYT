import prisma from '../config/database';

export class SearchService {
    async search(query: string) {
        if (!query) return { videos: [], channels: [] };
        const q = query.trim();

        // 1. Fetch matching channels
        const channels = await prisma.channel.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { handle: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                ],
            },
            take: 5,
        });

        const matchedOwnerIds = channels.map(c => c.ownerId);

        // 2. Fetch videos matching title, description, or channel info
        const videos = await prisma.video.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                    { user: { channel: { name: { contains: q, mode: 'insensitive' } } } },
                    { user: { channel: { handle: { contains: q, mode: 'insensitive' } } } },
                ],
                status: 'ready',
            },
            include: {
                user: {
                    include: {
                        channel: true,
                    },
                },
            },
            orderBy: {
                views: 'desc',
            },
            take: 30,
        });

        // 3. Prioritize videos from exactly matched channels
        const sortedVideos = [...videos].sort((a, b) => {
            const aInChannels = matchedOwnerIds.includes(a.userId);
            const bInChannels = matchedOwnerIds.includes(b.userId);

            if (aInChannels && !bInChannels) return -1;
            if (!aInChannels && bInChannels) return 1;
            return 0;
        });

        return { videos: sortedVideos, channels };
    }

    async getSuggestions(query: string) {
        if (!query || query.length < 2) return [];

        const [videos, channels] = await Promise.all([
            prisma.video.findMany({
                where: {
                    title: { contains: query, mode: 'insensitive' },
                    status: 'ready',
                },
                select: { title: true },
                take: 5,
            }),
            prisma.channel.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' },
                },
                select: { name: true },
                take: 3,
            }),
        ]);

        const suggestions = [
            ...videos.map(v => ({ text: v.title, type: 'video' })),
            ...channels.map(c => ({ text: c.name, type: 'channel' })),
        ];

        return suggestions;
    }
}

export const searchService = new SearchService();

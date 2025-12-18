import { Video as FrontendVideo } from '@/data/mockData';

export const mapBackendVideoToFrontend = (video: any): FrontendVideo => {
    return {
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnailUrl || '/placeholder-thumbnail.jpg',
        channelName: video.user?.name || video.user?.username || 'Unknown Channel',
        channelAvatar: video.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.user?.username || 'default'}`,
        subscribers: '0', // Need subscriber count from user/channel relation
        views: video.views?.toString() || '0',
        postedAt: formatDate(video.createdAt),
        duration: formatDuration(video.duration),
        videoUrl: video.videoUrl || '',
        description: video.description || '',
        likes: '0', // Need likes from relation
        comments: [], // Need comments from relation
        category: 'All', // Need category
    };
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;

    return date.toLocaleDateString();
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
};

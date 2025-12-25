import { apiClient } from './client';

export interface ChannelOverview {
    totalViews: number;
    totalVideos: number;
    subscriberCount: number;
    totalComments: number;
    avgViewsPerVideo: number;
}

export interface ViewsDataPoint {
    date: string;
    views: number;
}

export interface TopVideo {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    views: number;
    likes: number;
    comments: number;
    publishedAt: string | null;
}

export interface RealtimeStats {
    subscriberCount: number;
    viewsLast48h: number;
    viewsLast60m: number;
}

export interface ChannelVideo {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    views: number;
    comments: number;
    status: string;
    publishedAt: string | null;
    createdAt: string;
}

export interface ChannelVideosResponse {
    videos: ChannelVideo[];
    total: number;
    hasMore: boolean;
}

export const analyticsApi = {
    getChannelOverview: async (channelId: string): Promise<{ success: boolean; data: ChannelOverview }> => {
        const response = await apiClient.get(`/analytics/channel/${channelId}/overview`);
        return response.data;
    },

    getViewsOverTime: async (channelId: string, days: number = 30): Promise<{ success: boolean; data: ViewsDataPoint[] }> => {
        const response = await apiClient.get(`/analytics/channel/${channelId}/views`, {
            params: { days }
        });
        return response.data;
    },

    getTopVideos: async (channelId: string, limit: number = 10): Promise<{ success: boolean; data: TopVideo[] }> => {
        const response = await apiClient.get(`/analytics/channel/${channelId}/top-videos`, {
            params: { limit }
        });
        return response.data;
    },

    getRealtimeStats: async (channelId: string): Promise<{ success: boolean; data: RealtimeStats }> => {
        const response = await apiClient.get(`/analytics/channel/${channelId}/realtime`);
        return response.data;
    },

    getChannelVideos: async (channelId: string, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data: ChannelVideosResponse }> => {
        const response = await apiClient.get(`/analytics/channel/${channelId}/videos`, {
            params: { limit, offset }
        });
        return response.data;
    }
};

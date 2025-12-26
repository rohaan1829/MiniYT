import { apiClient } from './client';

export interface WatchHistoryItem {
    id: string;
    videoId: string;
    duration: number;
    watchProgress: number;
    viewedAt: string;
    video: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
        duration: number | null;
        views: number;
        createdAt: string;
        user: {
            name: string | null;
            username: string;
            channel?: {
                id: string;
                handle: string;
            } | null;
        };
    };
}

export interface VideoProgress {
    watchProgress: number;
    duration: number;
    viewedAt?: string;
}

export const historyApi = {
    getWatchHistory: async (): Promise<{ success: boolean; data: WatchHistoryItem[] }> => {
        const response = await apiClient.get('/history/watch');
        return response.data;
    },

    recordProgress: async (videoId: string, watchProgress: number, duration?: number): Promise<{ success: boolean }> => {
        const response = await apiClient.post('/history/watch', { videoId, watchProgress, duration });
        return response.data;
    },

    getVideoProgress: async (videoId: string): Promise<{ success: boolean; data: VideoProgress }> => {
        const response = await apiClient.get(`/history/watch/${videoId}/progress`);
        return response.data;
    },

    deleteHistoryItem: async (videoId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete(`/history/watch/${videoId}`);
        return response.data;
    },

    clearWatchHistory: async (): Promise<{ success: boolean }> => {
        const response = await apiClient.delete('/history/watch');
        return response.data;
    },

    getSearchHistory: async () => {
        const response = await apiClient.get('/history/search');
        return response.data;
    },

    clearSearchHistory: async () => {
        const response = await apiClient.delete('/history/search');
        return response.data;
    },
};

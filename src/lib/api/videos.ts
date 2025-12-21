import { apiClient } from './client';

export interface VideoData {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    videoUrl: string;
    views: number;
    duration: number;
    createdAt: string;
    user: {
        id: string;
        username: string;
        name: string;
        channel: {
            id: string;
            handle: string;
            name: string;
            avatarUrl?: string;
        } | null;
    };
}

export const videoApi = {
    getVideos: async (params?: { category?: string; userId?: string; channelId?: string; limit?: number; offset?: number }) => {
        const response = await apiClient.get('/videos', { params });
        return response.data;
    },

    getVideo: async (id: string) => {
        const response = await apiClient.get(`/videos/${id}`);
        return response.data;
    },

    upload: async (formData: FormData) => {
        const response = await apiClient.post('/videos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await apiClient.patch(`/videos/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/videos/${id}`);
        return response.data;
    },
};

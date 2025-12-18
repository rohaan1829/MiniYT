import { apiClient } from './client';

export interface CreatePlaylistData {
    name: string;
    description?: string;
    isPublic?: boolean;
}

export const playlistApi = {
    getAll: async () => {
        const response = await apiClient.get('/playlists');
        return response.data;
    },
    create: async (data: CreatePlaylistData) => {
        const response = await apiClient.post('/playlists', data);
        return response.data;
    },
    addVideo: async (playlistId: string, videoId: string) => {
        const response = await apiClient.post(`/playlists/${playlistId}/videos`, { videoId });
        return response.data;
    },
    removeVideo: async (playlistId: string, videoId: string) => {
        const response = await apiClient.delete(`/playlists/${playlistId}/videos/${videoId}`);
        return response.data;
    },
};

import { apiClient } from './client';

export interface CreateChannelData {
    name: string;
    handle: string;
    description?: string;
}

export interface UpdateChannelData {
    name?: string;
    description?: string;
    bannerUrl?: string;
    avatarUrl?: string;
}

export const channelApi = {
    create: async (data: CreateChannelData) => {
        const response = await apiClient.post('/channels', data);
        return response.data;
    },

    getChannel: async (channelId: string) => {
        const response = await apiClient.get(`/channels/${channelId}`);
        return response.data;
    },

    getByHandle: async (handle: string) => {
        const response = await apiClient.get(`/channels/handle/${handle}`);
        return response.data;
    },

    update: async (channelId: string, data: UpdateChannelData) => {
        const response = await apiClient.patch(`/channels/${channelId}`, data);
        return response.data;
    },

    delete: async (channelId: string) => {
        const response = await apiClient.delete(`/channels/${channelId}`);
        return response.data;
    },
};

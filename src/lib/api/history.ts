import { apiClient } from './client';

export const historyApi = {
    getWatchHistory: async () => {
        const response = await apiClient.get('/history/watch');
        return response.data;
    },
    clearWatchHistory: async () => {
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

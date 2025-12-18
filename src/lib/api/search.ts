import { apiClient } from './client';

export const searchApi = {
    search: async (query: string) => {
        const response = await apiClient.get('/search', { params: { q: query } });
        return response.data;
    },
    getSuggestions: async (query: string) => {
        const response = await apiClient.get('/search/suggestions', { params: { q: query } });
        return response.data;
    },
};

import { apiClient } from './client';

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    name?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authApi = {
    register: async (data: RegisterData) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    refresh: async () => {
        const response = await apiClient.post('/auth/refresh');
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    updateProfile: async (data: { name?: string; email?: string; bio?: string; settings?: any }) => {
        const response = await apiClient.patch('/users/me', data);
        return response.data;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

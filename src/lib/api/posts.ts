import { apiClient } from './client';

export interface Post {
    id: string;
    userId: string;
    channelId: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO';
    content?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    visibility: 'PUBLIC' | 'SUBSCRIBERS_ONLY';
    likes: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        image?: string;
        channel?: {
            id: string;
            handle: string;
        };
    };
    _count: {
        comments: number;
        likedBy: number;
    };
}

export interface PostComment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    likes: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        image?: string;
    };
}

export const postsApi = {
    // Get channel posts
    getChannelPosts: async (channelId: string, params?: { limit?: number; offset?: number }) => {
        const response = await apiClient.get(`/posts/channel/${channelId}`, { params });
        return response.data;
    },

    // Get single post
    getPostById: async (id: string) => {
        const response = await apiClient.get(`/posts/${id}`);
        return response.data;
    },

    // Create post
    createPost: async (formData: FormData) => {
        const response = await apiClient.post('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update post
    updatePost: async (id: string, data: { content?: string; visibility?: string }) => {
        const response = await apiClient.patch(`/posts/${id}`, data);
        return response.data;
    },

    // Delete post
    deletePost: async (id: string) => {
        const response = await apiClient.delete(`/posts/${id}`);
        return response.data;
    },

    // Toggle like
    toggleLike: async (id: string) => {
        const response = await apiClient.post(`/posts/${id}/like`);
        return response.data;
    },

    // Add comment
    addComment: async (postId: string, content: string) => {
        const response = await apiClient.post(`/posts/${postId}/comments`, { content });
        return response.data;
    },

    // Get comments
    getComments: async (postId: string, params?: { limit?: number; offset?: number }) => {
        const response = await apiClient.get(`/posts/${postId}/comments`, { params });
        return response.data;
    },

    // Delete comment
    deleteComment: async (postId: string, commentId: string) => {
        const response = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
        return response.data;
    },
};

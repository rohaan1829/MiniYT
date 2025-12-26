import { apiClient } from './client';

export interface LikeStatus {
    liked: boolean;
    likeCount: number;
}

export interface InboxMessage {
    id: string;
    content: string;
    isRead: boolean;
    isPublic?: boolean;
    createdAt: string;
    user: {
        id: string;
        username: string;
        name: string | null;
        image: string | null;
    };
    video: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
    };
}

export interface InboxLike {
    id: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        name: string | null;
        image: string | null;
    };
    video: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
    };
}

export interface InboxResponse {
    comments: InboxMessage[];
    unreadCount: number;
    total: number;
}

export interface PublicComment {
    id: string;
    content: string;
    isRead: boolean;
    isPublic: boolean;
    createdAt: string;
    user: {
        id: string;
        username: string;
        name: string | null;
        image: string | null;
    };
    replies: PublicComment[];
}

export interface PublicCommentsResponse {
    comments: PublicComment[];
    creatorId: string | null;
}

export const likesApi = {
    toggleLike: async (videoId: string): Promise<{ success: boolean; data: LikeStatus }> => {
        const response = await apiClient.post(`/videos/${videoId}/like`);
        return response.data;
    },

    getLikeStatus: async (videoId: string): Promise<{ success: boolean; data: LikeStatus }> => {
        const response = await apiClient.get(`/videos/${videoId}/like`);
        return response.data;
    }
};

export const commentsApi = {
    sendMessage: async (videoId: string, content: string): Promise<{ success: boolean; data: InboxMessage }> => {
        const response = await apiClient.post(`/videos/${videoId}/comments`, { content });
        return response.data;
    },

    getCount: async (videoId: string): Promise<{ success: boolean; data: { count: number } }> => {
        const response = await apiClient.get(`/videos/${videoId}/comments/count`);
        return response.data;
    },

    getPublicComments: async (videoId: string, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data: PublicCommentsResponse }> => {
        const response = await apiClient.get(`/videos/${videoId}/comments/public`, { params: { limit, offset } });
        return response.data;
    }
};

export const inboxApi = {
    getMessages: async (limit: number = 50, offset: number = 0): Promise<{ success: boolean; data: InboxResponse }> => {
        const response = await apiClient.get('/inbox', { params: { limit, offset } });
        return response.data;
    },

    getLikes: async (limit: number = 50, offset: number = 0): Promise<{ success: boolean; data: InboxLike[] }> => {
        const response = await apiClient.get('/inbox/likes', { params: { limit, offset } });
        return response.data;
    },

    markAsRead: async (messageId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.patch(`/inbox/${messageId}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<{ success: boolean; data: { markedAsRead: number } }> => {
        const response = await apiClient.patch('/inbox/read-all');
        return response.data;
    },

    deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete(`/inbox/${messageId}`);
        return response.data;
    },

    replyToMessage: async (messageId: string, content: string): Promise<{ success: boolean; data: any }> => {
        const response = await apiClient.post(`/inbox/${messageId}/reply`, { content });
        return response.data;
    }
};

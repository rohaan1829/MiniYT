import { apiClient } from './client';

export interface Notification {
    id: string;
    type: string;
    message: string;
    data: {
        videoId?: string;
        videoTitle?: string;
        commentId?: string;
        channelName?: string;
        channelHandle?: string;
    } | null;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
}

export const notificationsApi = {
    getNotifications: async (limit: number = 50, offset: number = 0): Promise<{ success: boolean; data: NotificationsResponse }> => {
        const response = await apiClient.get('/notifications', { params: { limit, offset } });
        return response.data;
    },

    getUnreadCount: async (): Promise<{ success: boolean; data: { unreadCount: number } }> => {
        const response = await apiClient.get('/notifications/count');
        return response.data;
    },

    markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<{ success: boolean; data: { markedAsRead: number } }> => {
        const response = await apiClient.patch('/notifications/read-all');
        return response.data;
    },

    deleteNotification: async (notificationId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete(`/notifications/${notificationId}`);
        return response.data;
    }
};

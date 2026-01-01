import { apiClient } from './client';

export interface SubscribedChannel {
    id: string;
    handle: string;
    name: string;
    avatarUrl: string | null;
    subscriberCount: number;
    verified: boolean;
    subscribedAt: string;
    notifyOnNewVideo: boolean;
}

export interface SubscriptionFeedVideo {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    views: number;
    publishedAt: string | null;
    createdAt: string;
    user: {
        id: string;
        username: string;
        name: string | null;
        image: string | null;
        channel: {
            id: string;
            handle: string;
            name: string;
            avatarUrl: string | null;
            verified: boolean;
        } | null;
    };
}

export interface SubscriptionListResponse {
    subscriptions: SubscribedChannel[];
    total: number;
    hasMore: boolean;
}

export interface SubscriptionFeedResponse {
    videos: SubscriptionFeedVideo[];
    total: number;
    hasMore: boolean;
}

export const subscriptionsApi = {
    /**
     * Get user's subscribed channels
     */
    getSubscriptions: async (limit: number = 50, offset: number = 0): Promise<{ success: boolean; data: SubscriptionListResponse }> => {
        const response = await apiClient.get('/subscriptions', {
            params: { limit, offset },
        });
        return response.data;
    },

    /**
     * Get video feed from subscribed channels
     */
    getSubscriptionFeed: async (limit: number = 20, offset: number = 0): Promise<{ success: boolean; data: SubscriptionFeedResponse }> => {
        const response = await apiClient.get('/subscriptions/feed', {
            params: { limit, offset },
        });
        return response.data;
    },

    /**
     * Toggle notification preference for a subscription
     */
    toggleNotifications: async (channelId: string, notify: boolean): Promise<{ success: boolean; data: { notifyOnNewVideo: boolean } }> => {
        const response = await apiClient.patch(`/subscriptions/${channelId}/notify`, { notify });
        return response.data;
    },

    /**
     * Check subscription status for a channel
     */
    getSubscriptionStatus: async (channelId: string): Promise<{ success: boolean; data: { subscribed: boolean; notifyOnNewVideo?: boolean } }> => {
        const response = await apiClient.get(`/subscriptions/${channelId}/status`);
        return response.data;
    },
};

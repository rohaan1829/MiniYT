import prisma from '../config/database';

interface NotificationData {
    videoId?: string;
    videoTitle?: string;
    commentId?: string;
    channelName?: string;
    channelHandle?: string;
}

export class NotificationsService {
    /**
     * Create a notification for a user
     */
    async createNotification(
        userId: string,
        type: string,
        message: string,
        data?: NotificationData
    ) {
        return await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                data: data as any
            }
        });
    }

    /**
     * Get notifications for a user
     */
    async getNotifications(userId: string, limit: number = 50, offset: number = 0) {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        const total = await prisma.notification.count({
            where: { userId }
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        return { notifications, total, unreadCount };
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await prisma.notification.count({
            where: { userId, isRead: false }
        });
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification || notification.userId !== userId) {
            return false;
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });

        return true;
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<number> {
        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        return result.count;
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification || notification.userId !== userId) {
            return false;
        }

        await prisma.notification.delete({
            where: { id: notificationId }
        });

        return true;
    }
}

export const notificationsService = new NotificationsService();

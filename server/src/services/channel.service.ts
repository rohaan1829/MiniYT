import prisma from '../config/database';
import { UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors';

interface CreateChannelInput {
    name: string;
    handle: string;
    description?: string;
}

interface UpdateChannelInput {
    name?: string;
    description?: string;
    bannerUrl?: string;
    avatarUrl?: string;
}

export const createChannel = async (userId: string, input: CreateChannelInput) => {
    // Check if user already has a channel
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { channel: true },
    });

    if (existingUser?.channel) {
        throw new ConflictError('You already have a channel');
    }

    // Check if handle is taken
    const handleExists = await prisma.channel.findUnique({
        where: { handle: input.handle },
    });

    if (handleExists) {
        throw new ConflictError('This handle is already taken');
    }

    // Create channel in transaction
    const channel = await prisma.$transaction(async (tx) => {
        const newChannel = await tx.channel.create({
            data: {
                name: input.name,
                handle: input.handle,
                description: input.description,
                ownerId: userId,
                avatarUrl: existingUser?.image,
            },
        });

        return newChannel;
    });

    return channel;
};

export const getChannel = async (channelId: string) => {
    const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (!channel) {
        throw new NotFoundError('Channel not found');
    }

    return channel;
};

export const getChannelByHandle = async (handle: string) => {
    const channel = await prisma.channel.findUnique({
        where: { handle },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (!channel) {
        throw new NotFoundError('Channel not found');
    }

    return channel;
};

export const updateChannel = async (
    channelId: string,
    userId: string,
    input: UpdateChannelInput
) => {
    // Verify ownership
    const channel = await prisma.channel.findUnique({
        where: { id: channelId },
    });

    if (!channel) {
        throw new NotFoundError('Channel not found');
    }

    if (channel.ownerId !== userId) {
        throw new UnauthorizedError('You do not own this channel');
    }

    // Update channel
    const updated = await prisma.channel.update({
        where: { id: channelId },
        data: input,
    });

    return updated;
};

export const deleteChannel = async (channelId: string, userId: string) => {
    const channel = await prisma.channel.findUnique({
        where: { id: channelId },
    });

    if (!channel) {
        throw new NotFoundError('Channel not found');
    }

    if (channel.ownerId !== userId) {
        throw new UnauthorizedError('You do not own this channel');
    }

    await prisma.channel.delete({
        where: { id: channelId },
    });
};

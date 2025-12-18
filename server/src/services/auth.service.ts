import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../config/database';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';

interface RegisterInput {
    email: string;
    username: string;
    password: string;
    name?: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export const register = async (input: RegisterInput) => {
    const { email, username, password, name } = input;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new ConflictError('Email already registered');
        }
        throw new ConflictError('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            name,
        },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            image: true,
            createdAt: true,
        },
    });

    return user;
};

export const login = async (input: LoginInput) => {
    const { email, password } = input;

    // Find user with channel
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            channel: {
                select: {
                    id: true,
                    handle: true,
                    name: true,
                    avatarUrl: true,
                    subscriberCount: true,
                    verified: true,
                },
            },
        },
    });

    if (!user || !user.password) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
            channelId: user.channel?.id || null,
        },
        config.jwtSecret,
        { expiresIn: '7d' }
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            avatar: user.image,
            channel: user.channel,
        },
        token,
    };
};

export const getProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            image: true,
            createdAt: true,
            _count: {
                select: {
                    videos: true,
                    comments: true,
                },
            },
            channel: {
                select: {
                    id: true,
                    handle: true,
                    name: true,
                    description: true,
                    avatarUrl: true,
                    bannerUrl: true,
                    subscriberCount: true,
                    videoCount: true,
                    verified: true,
                },
            },
        },
    });

    if (!user) {
        throw new BadRequestError('User not found');
    }

    return user;
};

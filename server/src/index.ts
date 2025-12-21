// Nudge to force reload
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { getRedisClient } from './config/redis';
import prisma from './config/database';

// Routes
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import userRouter from './routes/users';
import channelRouter from './routes/channels';
import historyRouter from './routes/history';
import playlistRouter from './routes/playlists';
import videoRouter from './routes/videos';
import searchRouter from './routes/search';
import './workers/video.worker'; // Import worker to start it

const app = express();

import path from 'path';

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded by frontend
}));
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(morgan('combined', {
    stream: { write: (msg: string) => logger.http(msg.trim()) },
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/channels', channelRouter);
app.use('/api/history', historyRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/videos', videoRouter);
app.use('/api/search', searchRouter);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handling
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');

    await prisma.$disconnect();
    logger.info('Database connection closed');

    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
    try {
        // Test database connection with retries
        let retries = 5;
        while (retries > 0) {
            try {
                await prisma.$connect();
                logger.info('✅ Database connected successfully');
                break;
            } catch (err) {
                retries -= 1;
                logger.warn(`⚠️ Database connection failed. Retries left: ${retries}`);
                if (retries === 0) throw err;
                // Wait 2 seconds before retrying
                await new Promise(res => setTimeout(res, 2000));
            }
        }

        // Test Redis connection (optional)
        const redis = getRedisClient();
        if (redis) {
            try {
                await redis.ping();
                logger.info('✅ Redis connected successfully');
            } catch (err) {
                logger.warn('⚠️  Redis ping failed, continuing without cache');
            }
        }

        // Start listening
        app.listen(config.port, () => {
            logger.info(`🚀 Server running on port ${config.port}`);
            logger.info(`📝 Environment: ${config.nodeEnv}`);
            logger.info(`🌐 Frontend URL: ${config.frontendUrl}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

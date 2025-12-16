import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
    if (!redis) {
        redis = new Redis(config.redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                logger.error('Redis connection error:', err);
                return true;
            },
        });

        redis.on('connect', () => {
            logger.info('✅ Redis connected successfully');
        });

        redis.on('error', (err) => {
            logger.error('❌ Redis error:', err);
        });

        redis.on('close', () => {
            logger.warn('⚠️  Redis connection closed');
        });
    }

    return redis;
};

export const closeRedis = async (): Promise<void> => {
    if (redis) {
        await redis.quit();
        redis = null;
    }
};

export default getRedisClient;

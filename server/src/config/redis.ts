import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;
let redisEnabled = false;

export const getRedisClient = (): Redis | null => {
    // Check if Redis URL is configured
    if (!config.redisUrl || config.redisUrl === '' || config.redisUrl.includes('password@host')) {
        if (!redisEnabled) {
            logger.warn('⚠️  Redis URL not configured - running without cache');
            redisEnabled = false;
        }
        return null;
    }

    if (!redis) {
        try {
            redis = new Redis(config.redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy(times) {
                    if (times > 3) {
                        logger.error('❌ Redis max retries reached - disabling Redis');
                        redisEnabled = false;
                        return null; // Stop retrying
                    }
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                reconnectOnError(err) {
                    logger.error('Redis connection error:', err.message);
                    return false; // Don't reconnect on error
                },
            });

            redis.on('connect', () => {
                logger.info('✅ Redis connected successfully');
                redisEnabled = true;
            });

            redis.on('error', (err) => {
                logger.error('❌ Redis error:', err.message);
                redisEnabled = false;
            });

            redis.on('close', () => {
                logger.warn('⚠️  Redis connection closed');
                redisEnabled = false;
            });
        } catch (err) {
            logger.error('❌ Failed to initialize Redis:', err);
            redis = null;
            redisEnabled = false;
        }
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

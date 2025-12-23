import { Queue } from 'bullmq';
import { config } from './env';

const getRedisConnection = () => {
    const url = new URL(config.redisUrl);
    return {
        host: url.hostname,
        port: parseInt(url.port),
        password: url.password,
        username: url.username,
        tls: url.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: null, // Critical for BullMQ
    };
};

export const connection = getRedisConnection();

export const videoQueue = new Queue('video-processing', {
    connection
});

export const VIDEO_JOBS = {
    PROCESS_VIDEO: 'process-video',
};

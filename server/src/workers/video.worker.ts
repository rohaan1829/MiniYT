import prisma from '../config/database';
import { videoProcessorService } from '../services/video-processor.service';
import { logger } from '../utils/logger';

let isRunning = false;

export async function startVideoWorker() {
    if (isRunning) return;
    isRunning = true;
    logger.info('Video Processing Worker started');

    // Run every 30 seconds to catch any stuck or new pending videos
    setInterval(async () => {
        try {
            const pendingVideos = await prisma.video.findMany({
                where: { status: 'pending' },
                take: 5
            });

            for (const video of pendingVideos) {
                logger.info(`Worker picking up video ${video.id} for processing`);
                videoProcessorService.processVideo(video.id).catch(err => {
                    logger.error(`Error in video worker for ${video.id}:`, err);
                });
            }
        } catch (error) {
            logger.error('Video Workers Error:', error);
        }
    }, 30000);
}

export function stopVideoWorker() {
    isRunning = false;
    logger.info('Video Processing Worker stopped');
}

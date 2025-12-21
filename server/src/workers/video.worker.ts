import { Worker, Job } from 'bullmq';
import { transcodeService } from '../services/transcode.service';
import { videoService } from '../services/video.service';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { connection } from '../config/queue';

export const videoWorker = new Worker(
    'video-processing',
    async (job: Job) => {
        const { videoId, tempPath } = job.data;

        try {
            logger.info(`Starting background processing for video: ${videoId}`);
            console.log(`[Worker] Received tempPath: ${tempPath}`);
            console.log(`[Worker] File exists at tempPath: ${fs.existsSync(tempPath)}`);

            // 1. Process video (thumbnail extraction, HLS, etc.)
            const result = await transcodeService.processVideo(tempPath, videoId);

            // 2. Update video metadata in database
            await videoService.updateVideo(videoId, job.data.userId, {
                videoUrl: result.videoUrl, // Use the new HLS URL
                thumbnailUrl: result.thumbnailUrl,
                status: 'ready'
            });

            logger.info(`Successfully processed video: ${videoId}`);

            // Clean up the entire processing directory
            const outputBase = path.dirname(tempPath);
            const videoFolder = path.basename(tempPath, path.extname(tempPath)) + '_processing';
            const localProcessDir = path.join(outputBase, videoFolder);

            console.log(`[Worker] Cleaning up processing directory: ${localProcessDir}`);
            if (fs.existsSync(localProcessDir)) {
                fs.rmSync(localProcessDir, { recursive: true, force: true });
            }

            // Still clean up original temp file 
            console.log(`[Worker] Cleaning up original temp file: ${tempPath}`);
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (error) {
            logger.error(`Error processing video ${videoId}:`, error);
            await videoService.updateVideo(videoId, job.data.userId, {
                status: 'failed'
            });
            throw error;
        }
    },
    { connection }
);

videoWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} has completed!`);
});

videoWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} has failed with ${err.message}`);
});

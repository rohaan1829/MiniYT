import prisma from '../config/database';
import { logger } from '../utils/logger';
import { transcodeService } from './transcode.service';
import path from 'path';
import fs from 'fs';

export class VideoProcessorService {
    async processVideo(videoId: string) {
        const video = await prisma.video.findUnique({ where: { id: videoId } });

        if (!video || !video.videoUrl) {
            logger.error(`Video ${videoId} not found or missing URL`);
            return;
        }

        // Extract filename from S3 URL or local path
        const filename = path.basename(video.videoUrl);
        const inputPath = path.join(__dirname, '../../uploads/videos', filename);

        // Verify file exists locally
        if (!fs.existsSync(inputPath)) {
            logger.error(`Source file not found for processing: ${inputPath}`);
            await prisma.video.update({
                where: { id: videoId },
                data: {
                    status: 'failed',
                    processingError: 'Local source file not found for transcoding'
                }
            });
            return;
        }

        try {
            await prisma.video.update({
                where: { id: videoId },
                data: { status: 'processing', processingProgress: 10 }
            });

            logger.info(`Starting transcoding for video ${videoId}`);
            const results = await transcodeService.processVideo(inputPath, videoId);

            await prisma.video.update({
                where: { id: videoId },
                data: {
                    status: 'ready',
                    videoUrl: results.videoUrl, // Updated to HLS URL (S3)
                    thumbnailUrl: results.thumbnailUrl, // Updated to Transcoded Thumbnail (S3)
                    processingProgress: 100,
                    publishedAt: new Date()
                }
            });

            logger.info(`Video ${videoId} processing complete and updated in DB`);

            // Optionally clean up the local raw file after successful processing
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
                logger.debug(`Cleaned up local raw file: ${inputPath}`);
            }

        } catch (error: any) {
            logger.error(`Error processing video ${videoId}:`, error);
            await prisma.video.update({
                where: { id: videoId },
                data: {
                    status: 'failed',
                    processingError: error.message
                }
            });
        }
    }
}

export const videoProcessorService = new VideoProcessorService();

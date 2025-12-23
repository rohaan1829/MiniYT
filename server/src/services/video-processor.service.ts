import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export class VideoProcessorService {
    async processVideo(videoId: string) {
        const video = await prisma.video.findUnique({ where: { id: videoId } });

        if (!video || !video.videoUrl) {
            logger.error(`Video ${videoId} not found or missing URL`);
            return;
        }

        const inputPath = path.join(__dirname, '../../', video.videoUrl);

        // Verify file exists
        if (!fs.existsSync(inputPath)) {
            logger.error(`Source file not found: ${inputPath}`);
            await prisma.video.update({
                where: { id: videoId },
                data: {
                    status: 'failed',
                    processingError: 'Source file not found'
                }
            });
            return;
        }

        await prisma.video.update({
            where: { id: videoId },
            data: { status: 'processing', processingProgress: 0 }
        });

        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .on('progress', async (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    // Update DB with progress (throttled to avoid DB overload)
                    if (percent % 10 === 0) {
                        try {
                            await prisma.video.update({
                                where: { id: videoId },
                                data: { processingProgress: percent }
                            });
                        } catch (err) {
                            logger.error('Error updating processing progress:', err);
                        }
                    }
                })
                .on('end', async () => {
                    logger.info(`Video ${videoId} processing complete`);
                    await prisma.video.update({
                        where: { id: videoId },
                        data: {
                            status: 'ready',
                            processingProgress: 100,
                            publishedAt: new Date()
                        }
                    });
                    resolve(true);
                })
                .on('error', async (err) => {
                    logger.error(`Error processing video ${videoId}:`, err);
                    await prisma.video.update({
                        where: { id: videoId },
                        data: {
                            status: 'failed',
                            processingError: err.message
                        }
                    });
                    reject(err);
                })
                .save(path.join(path.dirname(inputPath), `processed_${path.basename(inputPath)}`));
            // In a real app, we'd transcode to multiple resolutions (720p, 1080p, etc)
            // and potentially move the file or generate an HLS stream.
            // For now, we'll just simulate processing/validating.
        });
    }
}

export const videoProcessorService = new VideoProcessorService();

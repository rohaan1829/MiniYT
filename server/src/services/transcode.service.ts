import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { storageProvider } from './storage.service';
import { logger } from '../utils/logger';

export class TranscodeService {
    async extractThumbnail(videoPath: string, outputFolder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const fileName = `thumb-${path.basename(videoPath, path.extname(videoPath))}.png`;
            const outputPath = path.join(outputFolder, fileName);

            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ['00:00:01'],
                    filename: fileName,
                    folder: outputFolder,
                    size: '1280x720'
                })
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err));
        });
    }

    async generateHLS(videoPath: string, outputFolder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hlsFolder = path.join(outputFolder, 'hls');
            if (!fs.existsSync(hlsFolder)) {
                fs.mkdirSync(hlsFolder, { recursive: true });
            }

            ffmpeg(videoPath)
                .outputOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ])
                .output(path.join(hlsFolder, 'index.m3u8'))
                .on('end', () => resolve(hlsFolder))
                .on('error', (err) => reject(err))
                .run();
        });
    }

    async processVideo(
        tempVideoPath: string,
        videoId: string
    ): Promise<{ videoUrl: string; thumbnailUrl: string }> {
        const outputBase = path.dirname(tempVideoPath);
        const videoFolder = path.basename(tempVideoPath, path.extname(tempVideoPath));
        const processDir = path.join(outputBase, videoFolder);

        if (!fs.existsSync(processDir)) {
            fs.mkdirSync(processDir, { recursive: true });
        }

        logger.info(`Extracting thumbnail for video: ${videoId}`);
        const localThumbPath = await this.extractThumbnail(tempVideoPath, processDir);

        logger.info(`Generating HLS for video: ${videoId}`);
        const localHlsFolder = await this.generateHLS(tempVideoPath, processDir);

        // Upload results to S3
        logger.info(`Uploading processing results to S3 for video: ${videoId}`);

        // 1. Upload Thumbnail
        const thumbKey = await storageProvider.uploadFileFromPath(localThumbPath, {
            folder: 'thumbnails',
            contentType: 'image/png'
        });

        // 2. Upload HLS segments and playlist
        const hlsFiles = await fs.promises.readdir(localHlsFolder);
        let playlistKey = '';

        for (const file of hlsFiles) {
            const filePath = path.join(localHlsFolder, file);
            const isPlaylist = file.endsWith('.m3u8');
            const fileKey = await storageProvider.uploadFileFromPath(filePath, {
                folder: `hls/${videoId}`,
                filename: file,
                contentType: isPlaylist ? 'application/x-mpegURL' : 'video/MP2T'
            });

            if (isPlaylist) {
                playlistKey = fileKey;
            }
        }

        return {
            videoUrl: storageProvider.getPublicUrl(playlistKey),
            thumbnailUrl: storageProvider.getPublicUrl(thumbKey)
        };
    }
}

export const transcodeService = new TranscodeService();

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

            console.log(`[TranscodeService] Extracting thumbnail to: ${outputPath}`);

            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ['00:00:01'],
                    filename: fileName,
                    folder: outputFolder,
                    size: '1280x720'
                })
                .on('end', () => {
                    console.log(`[TranscodeService] Thumbnail extraction complete`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error(`[TranscodeService] Thumbnail extraction failed: ${err.message}`);
                    reject(err);
                });
        });
    }

    async generateHLS(videoPath: string, outputFolder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hlsFolder = path.join(outputFolder, 'hls');
            if (!fs.existsSync(hlsFolder)) {
                fs.mkdirSync(hlsFolder, { recursive: true });
            }

            console.log(`[TranscodeService] Generating HLS in: ${hlsFolder}`);

            ffmpeg(videoPath)
                .outputOptions([
                    '-profile:v baseline',      // Max compatibility
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 4',              // 4 sec segments (better for seeking)
                    '-hls_list_size 0',         // Keep all segments in playlist
                    '-hls_segment_type mpegts',
                    '-g 48',                    // Keyframe every 48 frames (2 sec at 24fps)
                    '-keyint_min 48',
                    '-sc_threshold 0',          // Disable scene change detection to force fixed GOP
                    '-bf 0',                    // No B-frames for faster seeking
                    '-movflags +faststart',     // Move metadata to start of file
                    '-f hls'
                ])
                .output(path.join(hlsFolder, 'index.m3u8'))
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`[TranscodeService] Transcoding: ${Math.round(progress.percent)}%`);
                    }
                })
                .on('end', () => {
                    console.log(`[TranscodeService] HLS generation complete`);
                    resolve(hlsFolder);
                })
                .on('error', (err) => {
                    console.error(`[TranscodeService] HLS generation failed: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    async getVideoMetadata(videoPath: string): Promise<{ duration: number; width: number; height: number }> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) return reject(err);
                const duration = metadata.format.duration || 0;
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                resolve({
                    duration: Math.round(duration),
                    width: videoStream?.width || 0,
                    height: videoStream?.height || 0
                });
            });
        });
    }

    async processVideo(
        tempVideoPath: string,
        videoId: string,
        options: { extractThumbnail?: boolean } = { extractThumbnail: true }
    ): Promise<{ videoUrl: string; thumbnailUrl?: string; duration: number }> {
        console.log(`[TranscodeService] Processing video: ${videoId}, path: ${tempVideoPath}, extractThumbnail: ${options.extractThumbnail}`);

        if (!fs.existsSync(tempVideoPath)) {
            throw new Error(`Input video file not found at path: ${tempVideoPath}`);
        }

        const metadata = await this.getVideoMetadata(tempVideoPath);
        console.log(`[TranscodeService] Metadata for ${videoId}:`, metadata);

        const outputBase = path.dirname(tempVideoPath);
        const videoFolder = path.basename(tempVideoPath, path.extname(tempVideoPath)) + '_processing';
        const processDir = path.join(outputBase, videoFolder);

        console.log(`[TranscodeService] Creating process directory: ${processDir}`);
        if (!fs.existsSync(processDir)) {
            fs.mkdirSync(processDir, { recursive: true });
        }

        let thumbnailUrl = '';

        if (options.extractThumbnail) {
            try {
                logger.info(`Extracting thumbnail for video: ${videoId}`);
                const localThumbPath = await this.extractThumbnail(tempVideoPath, processDir);

                // Upload Thumbnail to S3
                const thumbKey = await storageProvider.uploadFileFromPath(localThumbPath, {
                    folder: 'thumbnails',
                    contentType: 'image/png'
                });
                thumbnailUrl = storageProvider.getPublicUrl(thumbKey);
                console.log(`[TranscodeService] Thumbnail uploaded to S3: ${thumbnailUrl}`);
            } catch (err) {
                logger.error(`Thumbnail extraction failed for video ${videoId}, continuing without it:`, err);
            }
        }

        logger.info(`Generating HLS for video: ${videoId}`);
        const localHlsFolder = await this.generateHLS(tempVideoPath, processDir);

        // Upload HLS results to S3
        logger.info(`Uploading HLS segments to S3 for video: ${videoId}`);
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
            thumbnailUrl: thumbnailUrl || undefined,
            duration: metadata.duration
        };
    }
}

export const transcodeService = new TranscodeService();

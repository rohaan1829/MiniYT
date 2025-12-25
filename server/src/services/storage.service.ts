import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload, Progress } from '@aws-sdk/lib-storage';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface StorageOptions {
    folder?: string;
    filename?: string;
    contentType?: string;
    keepLocalFile?: boolean;
}

export interface IStorageProvider {
    uploadFile(file: Express.Multer.File, options?: StorageOptions): Promise<string>;
    uploadFileFromPath(filePath: string, options?: StorageOptions): Promise<string>;
    getPresignedUploadUrl(fileName: string, contentType: string, folder: string): Promise<{ url: string, key: string }>;
    deleteFile(fileUrl: string): Promise<void>;
    getPublicUrl(filePath: string): string;
}

class S3StorageProvider implements IStorageProvider {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            },
        });
        this.bucketName = config.aws.bucket;
    }

    async uploadFile(file: Express.Multer.File, options?: StorageOptions): Promise<string> {
        const folder = options?.folder || 'general';
        const ext = path.extname(file.originalname);
        const fileName = options?.filename || `${uuidv4()}${ext}`;
        const key = `${folder}/${fileName}`;

        console.log(`[StorageService] Starting streaming upload: ${file.path} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        // Use streaming upload for better performance with large files
        const fileStream = fs.createReadStream(file.path);

        const upload = new Upload({
            client: this.s3Client,
            params: {
                Bucket: this.bucketName,
                Key: key,
                Body: fileStream,
                ContentType: options?.contentType || file.mimetype,
            },
            // Multipart upload settings for large files
            queueSize: 4, // concurrent parts
            partSize: 10 * 1024 * 1024, // 10MB per part (minimum is 5MB)
            leavePartsOnError: false,
        });

        // Progress tracking
        upload.on('httpUploadProgress', (progress: Progress) => {
            if (progress.loaded && progress.total) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log(`[StorageService] Upload progress: ${percent}% (${(progress.loaded / 1024 / 1024).toFixed(2)}/${(progress.total / 1024 / 1024).toFixed(2)} MB)`);
            }
        });

        await upload.done();
        console.log(`[StorageService] Upload complete: ${key}`);

        // Clean up local temp file unless requested otherwise
        if (!options?.keepLocalFile && fs.existsSync(file.path)) {
            console.log(`[StorageService] Deleting local file: ${file.path}`);
            await fs.promises.unlink(file.path);
        } else if (options?.keepLocalFile) {
            console.log(`[StorageService] Keeping local file as requested: ${file.path}`);
        }

        return key;
    }

    async uploadFileFromPath(filePath: string, options?: StorageOptions): Promise<string> {
        const folder = options?.folder || 'general';
        const ext = path.extname(filePath);
        const fileName = options?.filename || `${uuidv4()}${ext}`;
        const key = `${folder}/${fileName}`;

        const stats = await fs.promises.stat(filePath);
        console.log(`[StorageService] Starting streaming upload from path: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        const fileStream = fs.createReadStream(filePath);

        const upload = new Upload({
            client: this.s3Client,
            params: {
                Bucket: this.bucketName,
                Key: key,
                Body: fileStream,
                ContentType: options?.contentType || 'application/octet-stream',
            },
            queueSize: 4,
            partSize: 10 * 1024 * 1024,
            leavePartsOnError: false,
        });

        upload.on('httpUploadProgress', (progress: Progress) => {
            if (progress.loaded && progress.total) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log(`[StorageService] Upload progress: ${percent}%`);
            }
        });

        await upload.done();
        console.log(`[StorageService] Upload complete: ${key}`);

        // Clean up local file unless requested otherwise
        if (!options?.keepLocalFile && fs.existsSync(filePath)) {
            console.log(`[StorageService] Deleting local file: ${filePath}`);
            await fs.promises.unlink(filePath);
        }

        return key;
    }

    async getPresignedUploadUrl(fileName: string, contentType: string, folder: string = 'videos'): Promise<{ url: string, key: string }> {
        const ext = path.extname(fileName);
        const uniqueFileName = `${uuidv4()}${ext}`;
        const key = `${folder}/${uniqueFileName}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        // URL expires in 1 hour
        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

        return { url, key };
    }

    async deleteFile(fileUrl: string): Promise<void> {
        // If it's a full URL, extract the key
        let key = fileUrl;
        if (fileUrl.includes('.amazonaws.com/')) {
            key = fileUrl.split('.amazonaws.com/')[1];
        }

        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
    }

    getPublicUrl(key: string): string {
        if (key.startsWith('http')) return key;
        return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
    }
}

export const storageProvider: IStorageProvider = new S3StorageProvider();


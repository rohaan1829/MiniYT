import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StorageOptions {
    folder?: string;
    filename?: string;
    contentType?: string;
    keepLocalFile?: boolean;
}

export interface IStorageProvider {
    uploadFile(file: Express.Multer.File, options?: StorageOptions): Promise<string>;
    uploadFileFromPath(filePath: string, options?: StorageOptions): Promise<string>;
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

        console.log(`[StorageService] Reading file for upload: ${file.path}`);
        const fileContent = await fs.promises.readFile(file.path);

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileContent,
            ContentType: options?.contentType || file.mimetype,
        });

        await this.s3Client.send(command);

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

        console.log(`[StorageService] Reading file from path: ${filePath}`);
        const fileContent = await fs.promises.readFile(filePath);

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileContent,
            ContentType: options?.contentType || 'application/octet-stream',
        });

        await this.s3Client.send(command);

        // Clean up local file unless requested otherwise
        if (!options?.keepLocalFile && fs.existsSync(filePath)) {
            console.log(`[StorageService] Deleting local file: ${filePath}`);
            await fs.promises.unlink(filePath);
        }

        return key;
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

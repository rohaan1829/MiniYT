import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

export interface StorageOptions {
    folder?: string;
    filename?: string;
}

export interface IStorageProvider {
    uploadFile(file: Express.Multer.File, options?: StorageOptions): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    getPublicUrl(filePath: string): string;
}

class LocalStorageProvider implements IStorageProvider {
    private uploadDir = path.join(__dirname, '../../uploads');

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File, options?: StorageOptions): Promise<string> {
        const folder = options?.folder || 'general';
        const targetDir = path.join(this.uploadDir, folder);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const ext = path.extname(file.originalname);
        const fileName = options?.filename || `${uuidv4()}${ext}`;
        const filePath = path.join(targetDir, fileName);

        await fs.promises.rename(file.path, filePath);

        return `/uploads/${folder}/${fileName}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl.startsWith('/uploads/')) return;

        const relativePath = fileUrl.replace('/uploads/', '');
        const absolutePath = path.join(this.uploadDir, relativePath);

        if (fs.existsSync(absolutePath)) {
            await fs.promises.unlink(absolutePath);
        }
    }

    getPublicUrl(fileUrl: string): string {
        // In local dev, it's just the backend URL + the path
        const baseUrl = config.nodeEnv === 'production' ? '' : `http://localhost:${config.port}`;
        return `${baseUrl}${fileUrl}`;
    }
}

// Future S3 implementation placeholder
/*
class S3StorageProvider implements IStorageProvider {
    async uploadFile(file: Express.Multer.File, options?: StorageOptions): Promise<string> {
        // S3 upload logic here
        return '';
    }
    async deleteFile(fileUrl: string): Promise<void> {
        // S3 delete logic here
    }
    getPublicUrl(filePath: string): string {
        // S3 public URL logic here
        return '';
    }
}
*/

export const storageProvider: IStorageProvider = new LocalStorageProvider();

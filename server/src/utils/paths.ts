import path from 'path';
import fs from 'fs';

// Root of the server directory (where package.json is)
export const SERVER_ROOT = path.resolve(__dirname, '..');

// Uploads root directory
export const UPLOADS_ROOT = path.join(SERVER_ROOT, 'uploads');

// Specific upload subdirectories
export const UPLOAD_DIRS = {
    PROFILES: path.join(UPLOADS_ROOT, 'profiles'),
    BANNERS: path.join(UPLOADS_ROOT, 'banners'),
    CHANNELS: path.join(UPLOADS_ROOT, 'channels'),
    VIDEOS: path.join(UPLOADS_ROOT, 'videos'),
    THUMBNAILS: path.join(UPLOADS_ROOT, 'thumbnails'),
};

// Ensure all directories exist
export const initializeUploadDirs = () => {
    Object.values(UPLOAD_DIRS).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`[PathUtils] Created directory: ${dir}`);
        }
    });
};

// Get path relative to server root for storage (if needed) but we prefer absolute
export const getAbsolutePath = (relativePath: string) => {
    return path.join(SERVER_ROOT, relativePath);
};

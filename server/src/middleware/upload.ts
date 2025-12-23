import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIRS, initializeUploadDirs } from '../utils/paths';

// Ensure upload directories exist on startup
initializeUploadDirs();

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        let dest = UPLOAD_DIRS.PROFILES;

        if (req.originalUrl.includes('/banner')) {
            dest = UPLOAD_DIRS.BANNERS;
        } else if (req.originalUrl.includes('/avatar')) {
            dest = UPLOAD_DIRS.CHANNELS;
        } else if (req.originalUrl.includes('/videos')) {
            dest = 'uploads/videos';
        } else if (req.originalUrl.includes('/posts')) {
            dest = 'uploads/posts';
        }

        cb(null, dest);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only standard images and videos are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
    },
});

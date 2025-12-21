import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
    'uploads/profiles',
    'uploads/banners',
    'uploads/channels',
    'uploads/videos',
    'uploads/thumbnails'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        let dest = 'uploads/profiles';

        if (req.originalUrl.includes('/banner')) {
            dest = 'uploads/banners';
        } else if (req.originalUrl.includes('/avatar')) {
            dest = 'uploads/channels';
        } else if (req.originalUrl.includes('/videos')) {
            dest = 'uploads/videos';
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

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'].includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only image files allowed'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

import { Router } from 'express';
import { uploadImage, getMyImages, compareUserImages } from '../controllers/image.controller';
import { protect, optionalAuth } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
const router = Router();
router.post('/upload', optionalAuth, upload.single('image'), uploadImage);
router.get('/my', protect, getMyImages);
router.post('/compare', protect, compareUserImages);
export default router;

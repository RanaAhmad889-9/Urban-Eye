import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { processAndSaveImage, getUserImages, compareImages } from '../services/image.service';

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const image = await processAndSaveImage(req.file.path, req.user?.id);
    return res.status(200).json({ message: 'Analyzed successfully', image });
  } catch (e: unknown) {
    return res.status(500).json({ message: (e as Error).message });
  }
};

export const getMyImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
    return res.status(200).json({ images: await getUserImages(req.user.id) });
  } catch (e: unknown) {
    return res.status(500).json({ message: (e as Error).message });
  }
};

export const compareUserImages = async (req: AuthRequest, res: Response) => {
  try {
    const { imageIds } = req.body;
    if (!Array.isArray(imageIds) || imageIds.length < 2)
      return res.status(400).json({ message: 'Provide at least 2 image IDs' });
    return res.status(200).json({ images: await compareImages(imageIds) });
  } catch (e: unknown) {
    return res.status(500).json({ message: (e as Error).message });
  }
};

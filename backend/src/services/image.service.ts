import path from 'path';
import fs from 'fs';
import Image from '../models/image.model';
import { analyzeImage } from './ml.service';

// ── Cloudinary (optional) ─────────────────────────────────────────────────────
// Uncomment after installing cloudinary and setting env vars.
// import { uploadToCloudinary, uploadBase64ToCloudinary } from './cloudinary.service';

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// ─────────────────────────────────────────────────────────────────────────────

export const processAndSaveImage = async (filePath: string, userId?: string) => {
  const mlResult = await analyzeImage(filePath);

  let imageUrl: string;
  let highlightedImageUrl: string | null = null;

  if (useCloudinary) {
    // ── Cloud storage path ────────────────────────────────────────
    // Uncomment after enabling cloudinary.service.ts:
    // imageUrl = await uploadToCloudinary(filePath);
    // if (mlResult.highlightedImagePath) {
    //   const b64 = fs.readFileSync(mlResult.highlightedImagePath).toString('base64');
    //   highlightedImageUrl = await uploadBase64ToCloudinary(b64);
    //   fs.unlink(mlResult.highlightedImagePath, () => {});
    // }

    // Placeholder until Cloudinary is enabled:
    imageUrl = `/uploads/${path.basename(filePath)}`;
    if (mlResult.highlightedImagePath) {
      highlightedImageUrl = `/uploads/${path.basename(mlResult.highlightedImagePath)}`;
    }
  } else {
    // ── Local filesystem path ─────────────────────────────────────
    imageUrl = `/uploads/${path.basename(filePath)}`;
    if (mlResult.highlightedImagePath) {
      highlightedImageUrl = `/uploads/${path.basename(mlResult.highlightedImagePath)}`;
    }
  }

  const image = await Image.create({
    userId: userId || null,
    imageUrl,
    highlightedImageUrl,
    isSatellite: mlResult.isSatellite,
    buildingCount: mlResult.buildingCount,
  });

  return image;
};

export const getUserImages = async (userId: string) => {
  return Image.find({ userId }).sort({ createdAt: -1 });
};

export const compareImages = async (imageIds: string[]) => {
  return Image.find({ _id: { $in: imageIds } });
};

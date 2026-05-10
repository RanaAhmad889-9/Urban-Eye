/**
 * Optional Cloudinary integration for persistent image storage.
 *
 * Without this, images are stored on the local filesystem.
 * On Render free tier the filesystem resets on redeploy.
 *
 * To enable:
 *   1. npm install cloudinary   (in backend/)
 *   2. Add to .env:
 *        CLOUDINARY_CLOUD_NAME=your_cloud_name
 *        CLOUDINARY_API_KEY=your_api_key
 *        CLOUDINARY_API_SECRET=your_api_secret
 *   3. In image.service.ts, import and call uploadToCloudinary() instead of
 *      saving locally, then store the returned URL in the DB.
 *
 * Cloudinary free tier: 25 GB storage, 25 GB bandwidth/month.
 */

// Uncomment everything below once you've installed cloudinary:

/*
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath: string, folder = 'urbaneye'): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  });
  // Delete local file after uploading
  fs.unlink(filePath, () => {});
  return result.secure_url;
};

export const uploadBase64ToCloudinary = async (base64: string, folder = 'urbaneye/highlighted'): Promise<string> => {
  const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64}`, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
*/

export {}; // keep TypeScript happy until you uncomment above

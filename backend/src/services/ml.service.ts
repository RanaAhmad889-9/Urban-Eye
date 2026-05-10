import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface MLResult {
  isSatellite: boolean;
  buildingCount: number;
  highlightedImage: string | null;   // base64 PNG string from ML service
}

export interface MLProcessed {
  isSatellite: boolean;
  buildingCount: number;
  highlightedImagePath: string | null;  // local file path after saving
}

/**
 * Call the ML service and save the returned highlighted image to disk.
 * Returns local paths for both images.
 */
export const analyzeImage = async (imagePath: string): Promise<MLProcessed> => {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));

  let result: MLResult;
  try {
    const response = await axios.post<MLResult>(`${ML_SERVICE_URL}/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 120_000,
    });
    result = response.data;
  } catch (err) {
    throw new Error('ML service unavailable. Make sure it is running on port 8000.');
  }

  // If satellite, save the highlighted overlay image returned as base64
  let highlightedImagePath: string | null = null;
  if (result.isSatellite && result.highlightedImage) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const originalName = path.basename(imagePath, path.extname(imagePath));
    const highlightedFilename = `${originalName}_highlighted.png`;
    const fullPath = path.join(uploadsDir, highlightedFilename);

    const buffer = Buffer.from(result.highlightedImage, 'base64');
    fs.writeFileSync(fullPath, buffer);
    highlightedImagePath = fullPath;
  }

  return {
    isSatellite: result.isSatellite,
    buildingCount: result.buildingCount,
    highlightedImagePath,
  };
};

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const UPLOAD_DIR = '/var/www/trulearnix/uploads/';

// Store in memory first so we can process images before saving to disk
export const uploadToS3 = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf', 'application/zip',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
});

/**
 * Process uploaded file:
 * - Images → sharp: preserve original format, quality 95 (lossless for PNG)
 * - Videos/PDFs/ZIP → save as-is (no quality loss)
 * Returns { filename, filepath }
 */
export async function processAndSaveUpload(file: Express.Multer.File): Promise<{ filename: string; filepath: string }> {
  const isImage = file.mimetype.startsWith('image/');
  const ext     = isImage ? getImageExt(file.mimetype) : path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  if (isImage) {
    // Process with sharp — maximum quality, no resize, no downscale
    let img = sharp(file.buffer, { failOnError: false });

    if (file.mimetype === 'image/jpeg') {
      await img.jpeg({ quality: 95, chromaSubsampling: '4:4:4', force: true }).toFile(filepath);
    } else if (file.mimetype === 'image/png') {
      await img.png({ compressionLevel: 1, effort: 1, force: true }).toFile(filepath); // minimal compression = max quality
    } else if (file.mimetype === 'image/webp') {
      await img.webp({ quality: 95, effort: 4, lossless: false, force: true }).toFile(filepath);
    } else if (file.mimetype === 'image/gif') {
      // GIF — save as-is (sharp doesn't re-encode animated GIFs well)
      fs.writeFileSync(filepath, file.buffer);
    } else {
      // Fallback: convert to high-quality WebP
      await img.webp({ quality: 95, effort: 4 }).toFile(filepath);
    }
  } else {
    // Videos, PDFs, ZIPs — save raw, zero quality loss
    fs.writeFileSync(filepath, file.buffer);
  }

  return { filename, filepath };
}

function getImageExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png':  '.png',
    'image/webp': '.webp',
    'image/gif':  '.gif',
  };
  return map[mime] || '.jpg';
}

export const deleteFromS3 = async (key: string) => {
  // Delete from local disk
  try {
    const localPath = path.join(UPLOAD_DIR, key);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  } catch {}
  // Also attempt S3 delete if configured
  try {
    if (process.env.AWS_S3_BUCKET) {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    }
  } catch {}
};

export const getSignedVideoUrl = async (key: string, _expiresIn = 3600): Promise<string> => {
  return `${process.env.API_URL || 'https://api.peptly.in'}/uploads/${key}`;
};

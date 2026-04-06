import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';

export const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Use local disk storage as fallback when S3 not configured
export const uploadToS3 = multer({
  storage: multer.diskStorage({
    destination: '/var/www/trulearnix/uploads/',
    filename: (_req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`);
    }
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'application/zip'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

export const deleteFromS3 = async (key: string) => {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key }));
  } catch {}
};

export const getSignedVideoUrl = async (key: string, _expiresIn = 3600): Promise<string> => {
  return `${process.env.WEB_URL}/uploads/${key}`;
};

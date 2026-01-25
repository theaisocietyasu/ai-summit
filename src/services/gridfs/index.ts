import { Request } from 'express';
import multer from 'multer';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { getGridFSBucket } from '../database';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.fieldname === 'resume') {
      if (file.mimetype !== 'application/pdf') {
        cb(new Error('Resume must be a PDF file'));
        return;
      }
    }
    cb(null, true);
  },
});

export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = getGridFSBucket();
  const uploadStream = bucket.openUploadStream(filename, {
    contentType,
  });

  const readable = Readable.from(buffer);

  return new Promise((resolve, reject) => {
    readable
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id));
  });
}

export async function getFileFromGridFS(fileId: ObjectId): Promise<{
  stream: NodeJS.ReadableStream;
  contentType: string;
  filename: string;
} | null> {
  const bucket = getGridFSBucket();

  const files = await bucket.find({ _id: fileId }).toArray();
  if (files.length === 0) {
    return null;
  }

  const file = files[0];
  const stream = bucket.openDownloadStream(fileId);

  return {
    stream,
    contentType: file.contentType || 'application/octet-stream',
    filename: file.filename,
  };
}

export async function deleteFileFromGridFS(fileId: ObjectId): Promise<void> {
  const bucket = getGridFSBucket();
  await bucket.delete(fileId);
}

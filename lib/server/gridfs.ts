import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "node:stream";
import { getDb } from "@/lib/server/mongo";

const bucketName = process.env.GRIDFS_BUCKET || "uploads";

export async function getGridFSBucket(): Promise<GridFSBucket> {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName });
}

export async function uploadToGridFS(params: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  metadata?: Record<string, unknown>;
}): Promise<ObjectId> {
  const bucket = await getGridFSBucket();
  const uploadStream = bucket.openUploadStream(params.filename, {
    metadata: {
      ...(params.metadata || {}),
      contentType: params.contentType,
    },
  });

  const readable = Readable.from(params.buffer);

  return new Promise((resolve, reject) => {
    readable
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id as ObjectId));
  });
}

export async function deleteFromGridFS(fileId: ObjectId): Promise<void> {
  const bucket = await getGridFSBucket();
  await bucket.delete(fileId);
}

export async function getFileFromGridFS(fileId: ObjectId): Promise<{
  stream: ReadableStream<Uint8Array>;
  contentType: string;
  filename: string;
  metadata?: Record<string, unknown>;
} | null> {
  const bucket = await getGridFSBucket();

  const files = await bucket.find({ _id: fileId }).toArray();
  if (files.length === 0) return null;

  const file = files[0];
  const nodeStream = bucket.openDownloadStream(fileId);

  const metadata = (file as unknown as { metadata?: Record<string, unknown> })
    .metadata;

  return {
    stream: Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>,
    contentType:
      (metadata?.contentType as string | undefined) ||
      "application/octet-stream",
    filename: file.filename,
    metadata,
  };
}

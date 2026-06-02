import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.STORAGE_ENDPOINT;
const accessKeyId = process.env.STORAGE_ACCESS_KEY;
const secretAccessKey = process.env.STORAGE_SECRET_KEY;
export const BUCKET_NAME = process.env.STORAGE_BUCKET || "aapm-storage";

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.warn("WARNING: Storage environment variables (STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY) are not fully configured.");
}

export const s3Client = new S3Client({
  endpoint,
  region: "us-east-1", // Standard placeholder region; MinIO does not enforce specific regions
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
  forcePathStyle: true, // Crucial for MinIO and local S3-compatibles to parse path-style URLs correctly
});

/**
 * Ensures that the required bucket exists in the storage instance.
 * If it doesn't exist, this function will attempt to create it.
 */
export async function ensureBucketExists() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      console.log(`[Storage] Bucket "${BUCKET_NAME}" does not exist. Creating bucket...`);
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`[Storage] Bucket "${BUCKET_NAME}" created successfully.`);
      } catch (createError) {
        console.error(`[Storage] Failed to create bucket "${BUCKET_NAME}":`, createError);
      }
    } else {
      console.error(`[Storage] Error checking bucket "${BUCKET_NAME}" status:`, error);
    }
  }
}

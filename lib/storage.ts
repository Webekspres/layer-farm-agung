import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.STORAGE_ENDPOINT;
const accessKeyId = process.env.STORAGE_ACCESS_KEY;
const secretAccessKey = process.env.STORAGE_SECRET_KEY;
export const BUCKET_NAME = process.env.STORAGE_BUCKET || "aapm-storage";

/** Cloudflare R2 S3 API host — bucket create belongs in the dashboard, not CreateBucket. */
function isR2Endpoint(value: string | undefined): boolean {
  return Boolean(value?.includes("r2.cloudflarestorage.com"));
}

/**
 * MinIO needs path-style. R2 works with virtual-hosted style (default false).
 * Override with STORAGE_FORCE_PATH_STYLE=true|false when needed.
 */
function resolveForcePathStyle(): boolean {
  const raw = process.env.STORAGE_FORCE_PATH_STYLE;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return !isR2Endpoint(endpoint);
}

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.warn(
    "WARNING: Storage environment variables (STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY) are not fully configured."
  );
}

export const s3Client = new S3Client({
  endpoint,
  // R2 uses "auto"; MinIO ignores region. us-east-1 also aliases to auto on R2.
  region: process.env.STORAGE_REGION || "auto",
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
  forcePathStyle: resolveForcePathStyle(),
});

/**
 * Ensures the configured bucket exists.
 * Local MinIO: creates the bucket if missing.
 * R2: only HeadBucket — create the bucket in the Cloudflare dashboard.
 */
export async function ensureBucketExists() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error: unknown) {
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    const notFound = err.name === "NotFound" || err.$metadata?.httpStatusCode === 404;

    if (!notFound) {
      console.error(`[Storage] Error checking bucket "${BUCKET_NAME}" status:`, error);
      return;
    }

    if (isR2Endpoint(endpoint)) {
      console.error(
        `[Storage] R2 bucket "${BUCKET_NAME}" not found. Create it in the Cloudflare dashboard, then retry.`
      );
      return;
    }

    console.log(`[Storage] Bucket "${BUCKET_NAME}" does not exist. Creating bucket...`);
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`[Storage] Bucket "${BUCKET_NAME}" created successfully.`);
    } catch (createError) {
      console.error(`[Storage] Failed to create bucket "${BUCKET_NAME}":`, createError);
    }
  }
}

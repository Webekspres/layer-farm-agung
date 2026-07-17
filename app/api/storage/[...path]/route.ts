import { NextRequest } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";

type StorageError = {
  name?: string;
  $metadata?: { httpStatusCode?: number };
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path;

  if (!pathParts || pathParts.length === 0) {
    return new Response("Path is required", { status: 400 });
  }

  const key = pathParts.join("/");

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return new Response("File not found", { status: 404 });
    }

    const body =
      typeof response.Body.transformToWebStream === "function"
        ? response.Body.transformToWebStream()
        : (response.Body as ReadableStream);

    return new Response(body, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    const err = error as StorageError;
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
      return new Response("File not found", { status: 404 });
    }
    console.error(`[Storage Proxy] Error fetching key "${key}" from storage:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

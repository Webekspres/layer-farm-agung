import { NextRequest } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
  request: NextRequest,
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

    // Next.js Response constructor natively accepts the Node.js/Web Readable stream returned by the S3 client
    return new Response(response.Body as any, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        // Cache logos/media for 1 year with immutable tag to optimize performance since names are unique/versioned
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return new Response("File not found", { status: 404 });
    }
    console.error(`[Storage Proxy] Error fetching key "${key}" from storage:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/features/auth/lib/session";
import { revalidatePath } from "next/cache";
import { s3Client, BUCKET_NAME, ensureBucketExists } from "@/lib/storage";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Sesi tidak ditemukan." }, { status: 401 });
  }

  const isGlobalAdmin = session.user.tenantId === null;
  const isTenantAdmin = session.user.roleName === "admin";

  if (isGlobalAdmin || !isTenantAdmin) {
    return Response.json(
      { error: "Anda tidak memiliki akses untuk mengubah logo." },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Gagal membaca data upload." }, { status: 400 });
  }

  const file = formData.get("logo");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "File logo tidak ditemukan." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Format file tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG." },
      { status: 422 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "Ukuran file melebihi batas 2 MB." },
      { status: 422 }
    );
  }

  // Determine extension
  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const ext = extMap[file.type] ?? "png";

  const tenantId = session.user.tenantId!;
  const s3Key = `tenants/${tenantId}/logo.${ext}`;
  const publicPath = `/api/storage/${s3Key}`;

  // Ensure our MinIO bucket exists before we start uploading
  try {
    await ensureBucketExists();
  } catch (error) {
    console.error("[Storage] Failed to assert storage bucket exists:", error);
    return Response.json({ error: "Gagal menginisialisasi penyimpanan." }, { status: 500 });
  }

  // Delete the previous logo file or object if it exists and is a different path
  // (covers cross-extension replacements: e.g. old .png replaced by new .webp)
  try {
    const existing = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { logo_url: true },
    });

    if (existing?.logo_url && existing.logo_url !== publicPath) {
      if (existing.logo_url.startsWith("/api/storage/")) {
        // Clean up from S3/MinIO
        const oldKey = existing.logo_url.replace("/api/storage/", "");
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: oldKey,
          })
        );
      } else if (existing.logo_url.startsWith("/uploads/logos/")) {
        // Clean up old local file if migrating
        const oldFilePath = path.join(process.cwd(), "public", existing.logo_url);
        await unlink(oldFilePath).catch(() => {});
      }
    }
  } catch (error) {
    console.error("[Storage] Non-fatal error cleaning up old logo:", error);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      })
    );
  } catch (error) {
    console.error("[Storage] S3 PutObject failed:", error);
    return Response.json({ error: "Gagal menyimpan file ke penyimpanan." }, { status: 500 });
  }

  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logo_url: publicPath },
    });
  } catch {
    return Response.json({ error: "Gagal memperbarui data branding." }, { status: 500 });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return Response.json({ success: true, logoUrl: publicPath });
}

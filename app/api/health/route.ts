import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      status: "ok",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: "error",
      },
      { status: 503 },
    );
  }
}

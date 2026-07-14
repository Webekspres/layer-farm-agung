import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const filePath = path.join(process.cwd(), "docs", "apicontract", "openapi.yaml");
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
      },
    });
  } catch {
    return new NextResponse("OpenAPI spec file not found", { status: 404 });
  }
}

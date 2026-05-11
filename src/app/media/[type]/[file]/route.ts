import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveUploadPath } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["covers", "products"]);

function contentTypeFromExt(ext: string) {
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { type: string; file: string } | Promise<{ type: string; file: string }> },
) {
  const { type, file } = await Promise.resolve(params);

  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!file || file.includes("/") || file.includes("\\") || file.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const relativePath = path.posix.join("public", type, file);
  const abs = resolveUploadPath(relativePath);

  try {
    const buf = await readFile(abs);
    const ext = file.toLowerCase().split(".").pop() ?? "";
    return new NextResponse(buf, {
      headers: {
        "content-type": contentTypeFromExt(ext),
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}


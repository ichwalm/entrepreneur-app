import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { resolveUploadPath } from "@/lib/storage";

export const runtime = "nodejs";

function contentTypeFromName(name: string) {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf") return "application/pdf";
  if (ext === "epub") return "application/epub+zip";
  return "application/octet-stream";
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
  const ebook = await prisma.ebook.findUnique({ where: { id } });
  if (!ebook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (ebook.fileUrl.startsWith("http://") || ebook.fileUrl.startsWith("https://")) {
    return NextResponse.redirect(ebook.fileUrl);
  }

  const abs = resolveUploadPath(ebook.fileUrl);
  try {
    const info = await stat(abs);
    const nodeStream = createReadStream(abs);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "content-type": contentTypeFromName(ebook.fileName),
        "content-length": String(info.size),
        "content-disposition": `attachment; filename="${encodeURIComponent(
          ebook.fileName,
        )}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  }
}

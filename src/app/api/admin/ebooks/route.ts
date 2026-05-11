import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { assertFileOk, ebookCreateSchema } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_EBOOK_BYTES = 50 * 1024 * 1024;
const MAX_COVER_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({ action: "upload_ebook", limit: 5, windowMs: 60_000 });

    const form = await req.formData();
    const title = sanitizeText(String(form.get("title") ?? ""));
    const description = sanitizeText(String(form.get("description") ?? ""));
    const category = sanitizeText(String(form.get("category") ?? ""));
    ebookCreateSchema.parse({ title, description, category });

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File e-book wajib." }, { status: 400 });
    }

    assertFileOk(file, {
      maxBytes: MAX_EBOOK_BYTES,
      allowedMime: ["application/pdf", "application/epub+zip"],
      allowedExt: ["pdf", "epub"],
    });

    const cover = form.get("cover");
    let coverUrl: string | null = null;
    let coverName: string | null = null;

    if (cover instanceof File && cover.size > 0) {
      assertFileOk(cover, {
        maxBytes: MAX_COVER_BYTES,
        allowedMime: ["image/jpeg", "image/png", "image/webp"],
        allowedExt: ["jpg", "jpeg", "png", "webp"],
      });
      const uploadedCover = await put(
        `covers/${Date.now()}-${cover.name}`.replaceAll(" ", "_"),
        cover,
        { access: "public" },
      );
      coverUrl = uploadedCover.url;
      coverName = cover.name;
    }

    const uploaded = await put(
      `ebooks/${Date.now()}-${file.name}`.replaceAll(" ", "_"),
      file,
      { access: "public" },
    );

    const ebook = await prisma.ebook.create({
      data: {
        title,
        description,
        category,
        fileUrl: uploaded.url,
        fileName: file.name,
        coverUrl,
        coverName,
      },
    });

    return NextResponse.json({ ok: true, id: ebook.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


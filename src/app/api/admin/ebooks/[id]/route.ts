import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { sanitizeRichText, sanitizeText } from "@/lib/sanitize";
import { assertFileOk, ebookCreateSchema } from "@/lib/validators";
import { saveUploadToDisk } from "@/lib/storage";
import { parseTags, upsertTags } from "@/lib/tags";

export const runtime = "nodejs";

const MAX_EBOOK_BYTES = 50 * 1024 * 1024;
const MAX_COVER_BYTES = 5 * 1024 * 1024;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({ action: "update_ebook", limit: 40, windowMs: 60_000 });
    const { id } = await Promise.resolve(params);
    const form = await req.formData();

    const title = sanitizeText(String(form.get("title") ?? ""));
    const description = sanitizeText(String(form.get("description") ?? ""));
    const descriptionHtmlRaw = form.get("descriptionHtml");
    const descriptionHtml =
      typeof descriptionHtmlRaw === "string" && descriptionHtmlRaw.trim()
        ? sanitizeRichText(descriptionHtmlRaw)
        : null;
    const category = sanitizeText(String(form.get("category") ?? ""));

    const tagsRaw = form.get("tags");
    const tags =
      typeof tagsRaw === "string" && tagsRaw.trim() ? parseTags(tagsRaw) : [];

    ebookCreateSchema.parse({ title, description, descriptionHtml, category, tags });

    const file = form.get("file");
    const cover = form.get("cover");
    let nextFileUrl: string | undefined;
    let nextFileName: string | undefined;
    let nextCoverUrl: string | null | undefined;
    let nextCoverName: string | null | undefined;

    if (file instanceof File && file.size > 0) {
      assertFileOk(file, {
        maxBytes: MAX_EBOOK_BYTES,
        allowedMime: ["application/pdf", "application/epub+zip"],
        allowedExt: ["pdf", "epub"],
      });
      const savedEbook = await saveUploadToDisk({
        file,
        relativeDir: "private/ebooks",
        maxBytes: MAX_EBOOK_BYTES,
        allowedMime: ["application/pdf", "application/epub+zip"],
        allowedExt: ["pdf", "epub"],
      });
      nextFileUrl = savedEbook.relativePath;
      nextFileName = file.name;
    }

    if (cover instanceof File && cover.size > 0) {
      assertFileOk(cover, {
        maxBytes: MAX_COVER_BYTES,
        allowedMime: ["image/jpeg", "image/png", "image/webp"],
        allowedExt: ["jpg", "jpeg", "png", "webp"],
      });
      const savedCover = await saveUploadToDisk({
        file: cover,
        relativeDir: "public/covers",
        maxBytes: MAX_COVER_BYTES,
        allowedMime: ["image/jpeg", "image/png", "image/webp"],
        allowedExt: ["jpg", "jpeg", "png", "webp"],
      });
      nextCoverUrl = `/media/covers/${savedCover.storedName}`;
      nextCoverName = cover.name;
    }

    await prisma.ebook.update({
      where: { id },
      data: {
        title,
        description,
        descriptionHtml,
        category,
        ...(nextFileUrl ? { fileUrl: nextFileUrl } : {}),
        ...(nextFileName ? { fileName: nextFileName } : {}),
        ...(nextCoverUrl !== undefined ? { coverUrl: nextCoverUrl } : {}),
        ...(nextCoverName !== undefined ? { coverName: nextCoverName } : {}),
      },
    });

    await prisma.ebookTag.deleteMany({ where: { ebookId: id } });
    if (tags.length > 0) {
      const tagRows = await upsertTags(tags);
      await prisma.ebookTag.createMany({
        data: tagRows.map((t) => ({ ebookId: id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({ action: "delete_ebook", limit: 20, windowMs: 60_000 });
    const { id } = await Promise.resolve(params);
    await prisma.ebook.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

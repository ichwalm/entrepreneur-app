import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { bannerSchema, assertFileOk } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { saveUploadToDisk } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({ action: "banner", limit: 20, windowMs: 60_000 });
    const form = await req.formData();

    const title = sanitizeText(String(form.get("title") ?? ""));
    const subtitleRaw = form.get("subtitle");
    const subtitle =
      typeof subtitleRaw === "string" && subtitleRaw.trim()
        ? sanitizeText(subtitleRaw)
        : null;
    const linkUrlRaw = form.get("linkUrl");
    const linkUrl =
      typeof linkUrlRaw === "string" && linkUrlRaw.trim() ? linkUrlRaw.trim() : null;
    const isActiveRaw = form.get("isActive");
    const isActive = typeof isActiveRaw === "string" ? isActiveRaw === "true" : true;
    const sortOrderRaw = form.get("sortOrder");
    const sortOrder =
      typeof sortOrderRaw === "string" && sortOrderRaw.trim()
        ? Number(sortOrderRaw)
        : 0;

    bannerSchema.parse({ title, subtitle, linkUrl, isActive, sortOrder });

    const image = form.get("image");
    let imageUrl: string | null = null;
    if (image instanceof File && image.size > 0) {
      assertFileOk(image, {
        maxBytes: MAX_IMAGE_BYTES,
        allowedMime: ["image/jpeg", "image/png", "image/webp"],
        allowedExt: ["jpg", "jpeg", "png", "webp"],
      });
      const saved = await saveUploadToDisk({
        file: image,
        relativeDir: "public/banners",
        maxBytes: MAX_IMAGE_BYTES,
        allowedMime: ["image/jpeg", "image/png", "image/webp"],
        allowedExt: ["jpg", "jpeg", "png", "webp"],
      });
      imageUrl = `/media/banners/${saved.storedName}`;
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        linkUrl,
        isActive,
        sortOrder,
        imageUrl,
      },
    });

    return NextResponse.json({ ok: true, id: banner.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText, sanitizeText } from "@/lib/sanitize";
import { assertFileOk, productCreateSchema } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { saveUploadToDisk } from "@/lib/storage";
import { parseTags, upsertTags } from "@/lib/tags";
import { z } from "zod";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function formatZodError(err: z.ZodError) {
  const mapped = err.issues.map((i) => {
    const field = i.path.join(".");
    if (field === "description" && i.code === "too_small") {
      return "Ringkasan/deskripsi minimal 10 karakter.";
    }
    if (field === "title" && i.code === "too_small") {
      return "Judul minimal 2 karakter.";
    }
    return i.message;
  });

  const unique = Array.from(new Set(mapped.filter(Boolean)));
  return unique.join(" ");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "PUBLIC") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await rateLimitOrThrow({
      action: "submit_product",
      limit: 5,
      windowMs: 60_000,
    });

    const form = await req.formData();
    const title = sanitizeText(String(form.get("title") ?? ""));
    const description = sanitizeText(String(form.get("description") ?? ""));
    const descriptionHtmlRaw = form.get("descriptionHtml");
    const descriptionHtml =
      typeof descriptionHtmlRaw === "string" && descriptionHtmlRaw.trim()
        ? sanitizeRichText(descriptionHtmlRaw)
        : null;

    const locationNameRaw = form.get("locationName");
    const locationName = locationNameRaw ? sanitizeText(String(locationNameRaw)) : null;

    const categoryRaw = form.get("category");
    const category =
      typeof categoryRaw === "string" && categoryRaw.trim()
        ? sanitizeText(categoryRaw)
        : null;

    const tagsRaw = form.get("tags");
    const tags = typeof tagsRaw === "string" && tagsRaw.trim() ? parseTags(tagsRaw) : [];

    const instagramRaw = form.get("instagram");
    const whatsappRaw = form.get("whatsapp");
    const facebookRaw = form.get("facebook");

    const instagram =
      typeof instagramRaw === "string" && instagramRaw.trim() ? instagramRaw.trim() : null;
    const whatsapp =
      typeof whatsappRaw === "string" && whatsappRaw.trim() ? whatsappRaw.trim() : null;
    const facebook =
      typeof facebookRaw === "string" && facebookRaw.trim() ? facebookRaw.trim() : null;

    productCreateSchema.parse({
      title,
      description,
      descriptionHtml,
      locationName,
      category,
      isFeatured: false,
      tags,
      instagram,
      whatsapp,
      facebook,
    });

    const images = form.getAll("images").filter((x) => x instanceof File) as File[];
    const normalizedImages = images.filter((f) => f.size > 0);
    for (const img of normalizedImages) {
      assertFileOk(img, {
        maxBytes: MAX_IMAGE_BYTES,
        allowedMime: ["image/jpeg", "image/png", "image/webp"],
        allowedExt: ["jpg", "jpeg", "png", "webp"],
      });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        descriptionHtml,
        category,
        isFeatured: false,
        status: "PENDING",
        locationName,
        submittedById: session.user.id,
      },
    });

    if (tags.length > 0) {
      const tagRows = await upsertTags(tags);
      await prisma.productTag.createMany({
        data: tagRows.map((t) => ({ productId: product.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    if (instagram || whatsapp || facebook) {
      await prisma.socialMediaLink.create({
        data: {
          productId: product.id,
          instagram,
          whatsapp,
          facebook,
        },
      });
    }

    if (normalizedImages.length > 0) {
      const saved = await Promise.all(
        normalizedImages.map(async (img) => {
          const out = await saveUploadToDisk({
            file: img,
            relativeDir: "public/products",
            maxBytes: MAX_IMAGE_BYTES,
            allowedMime: ["image/jpeg", "image/png", "image/webp"],
            allowedExt: ["jpg", "jpeg", "png", "webp"],
          });
          return { url: `/media/products/${out.storedName}`, fileName: img.name };
        }),
      );

      await prisma.productImage.createMany({
        data: saved.map((u) => ({
          productId: product.id,
          url: u.url,
          fileName: u.fileName,
        })),
      });
    }

    return NextResponse.json({ ok: true, id: product.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(e) }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

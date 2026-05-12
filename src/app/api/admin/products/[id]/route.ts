import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { sanitizeRichText, sanitizeText } from "@/lib/sanitize";
import { assertFileOk, productCreateSchema } from "@/lib/validators";
import { saveUploadToDisk } from "@/lib/storage";
import { parseTags, upsertTags } from "@/lib/tags";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({
      action: "update_product",
      limit: 60,
      windowMs: 60_000,
    });
    const { id } = await Promise.resolve(params);
    const form = await req.formData();

    const title = sanitizeText(String(form.get("title") ?? ""));
    const description = sanitizeText(String(form.get("description") ?? ""));
    const descriptionHtmlRaw = form.get("descriptionHtml");
    const descriptionHtml =
      typeof descriptionHtmlRaw === "string" && descriptionHtmlRaw.trim()
        ? sanitizeRichText(descriptionHtmlRaw)
        : null;

    const locationNameRaw = form.get("locationName");
    const locationName = locationNameRaw
      ? sanitizeText(String(locationNameRaw))
      : null;

    const categoryRaw = form.get("category");
    const category =
      typeof categoryRaw === "string" && categoryRaw.trim()
        ? sanitizeText(categoryRaw)
        : null;

    const isFeaturedRaw = form.get("isFeatured");
    const isFeatured =
      typeof isFeaturedRaw === "string" ? isFeaturedRaw === "true" : false;

    const tagsRaw = form.get("tags");
    const tags =
      typeof tagsRaw === "string" && tagsRaw.trim() ? parseTags(tagsRaw) : [];

    const instagramRaw = form.get("instagram");
    const whatsappRaw = form.get("whatsapp");
    const facebookRaw = form.get("facebook");

    const instagram =
      typeof instagramRaw === "string" && instagramRaw.trim()
        ? instagramRaw.trim()
        : null;
    const whatsapp =
      typeof whatsappRaw === "string" && whatsappRaw.trim()
        ? sanitizeText(whatsappRaw)
        : null;
    const facebook =
      typeof facebookRaw === "string" && facebookRaw.trim()
        ? facebookRaw.trim()
        : null;

    productCreateSchema.parse({
      title,
      description,
      descriptionHtml,
      locationName,
      category,
      isFeatured,
      tags,
      instagram,
      whatsapp,
      facebook,
    });

    const imageFiles = form.getAll("images").filter((x) => x instanceof File) as File[];
    const images = imageFiles.filter((f) => f.size > 0);

    for (const img of images) {
      assertFileOk(img, {
        maxBytes: MAX_IMAGE_BYTES,
        allowedMime: ["image/jpeg", "image/png", "image/webp"],
        allowedExt: ["jpg", "jpeg", "png", "webp"],
      });
    }

    await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        descriptionHtml,
        category,
        isFeatured,
        locationName,
      },
    });

    await prisma.socialMediaLink.deleteMany({ where: { productId: id } });
    if (instagram || whatsapp || facebook) {
      await prisma.socialMediaLink.create({
        data: {
          productId: id,
          instagram,
          whatsapp,
          facebook,
        },
      });
    }

    await prisma.productTag.deleteMany({ where: { productId: id } });
    if (tags.length > 0) {
      const tagRows = await upsertTags(tags);
      await prisma.productTag.createMany({
        data: tagRows.map((t) => ({ productId: id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    if (images.length > 0) {
      const saved = await Promise.all(
        images.map(async (img) => {
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
          productId: id,
          url: u.url,
          fileName: u.fileName,
        })),
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
    await rateLimitOrThrow({
      action: "delete_product",
      limit: 20,
      windowMs: 60_000,
    });
    const { id } = await Promise.resolve(params);
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

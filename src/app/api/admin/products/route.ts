import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { assertFileOk, productCreateSchema } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({
      action: "upload_product",
      limit: 5,
      windowMs: 60_000,
    });

    const form = await req.formData();
    const title = sanitizeText(String(form.get("title") ?? ""));
    const description = sanitizeText(String(form.get("description") ?? ""));

    const locationNameRaw = form.get("locationName");
    const locationName = locationNameRaw
      ? sanitizeText(String(locationNameRaw))
      : null;

    const instagramRaw = form.get("instagram");
    const whatsappRaw = form.get("whatsapp");
    const facebookRaw = form.get("facebook");

    const instagram =
      typeof instagramRaw === "string" && instagramRaw.trim()
        ? instagramRaw.trim()
        : null;
    const whatsapp =
      typeof whatsappRaw === "string" && whatsappRaw.trim()
        ? whatsappRaw.trim()
        : null;
    const facebook =
      typeof facebookRaw === "string" && facebookRaw.trim()
        ? facebookRaw.trim()
        : null;

    productCreateSchema.parse({
      title,
      description,
      locationName,
      instagram,
      whatsapp,
      facebook,
    });

    const images = form.getAll("images").filter((x) => x instanceof File) as File[];
    for (const img of images) {
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
        locationName,
      },
    });

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

    if (images.length > 0) {
      const uploaded = await Promise.all(
        images.map(async (img) => {
          const blob = await put(
            `products/${product.id}/${Date.now()}-${img.name}`.replaceAll(" ", "_"),
            img,
            { access: "public" },
          );
          return { url: blob.url, fileName: img.name };
        }),
      );

      await prisma.productImage.createMany({
        data: uploaded.map((u) => ({
          productId: product.id,
          url: u.url,
          fileName: u.fileName,
        })),
      });
    }

    return NextResponse.json({ ok: true, id: product.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

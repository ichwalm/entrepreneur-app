import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getBaseUrl() {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL;
  if (!env) return "http://localhost:3000";
  if (env.startsWith("http://") || env.startsWith("https://")) return env;
  return `https://${env}`;
}

function toAbsolute(baseUrl: string, url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const [products, ebooks] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, updatedAt: true, images: { take: 1, select: { url: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.ebook.findMany({
      select: { id: true, uploadedAt: true, coverUrl: true },
      orderBy: { uploadedAt: "desc" },
    }),
  ]);

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...products.map((p) => ({
      url: `${baseUrl}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: p.images[0]?.url ? [toAbsolute(baseUrl, p.images[0].url)] : undefined,
    })),
    ...ebooks.map((e) => ({
      url: `${baseUrl}/ebooks/${e.id}`,
      lastModified: e.uploadedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: e.coverUrl ? [toAbsolute(baseUrl, e.coverUrl)] : undefined,
    })),
  ];
}

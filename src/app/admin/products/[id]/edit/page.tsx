import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCreateForm } from "../../new/product-form";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const [product, categories, tags] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { createdAt: "asc" } },
        socialLink: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      where: { category: { not: null } },
    }),
    prisma.tag.findMany({
      select: { name: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const categoryOptions = categories
    .map((c) => c.category)
    .filter((c): c is string => !!c)
    .sort((a, b) => String(a).localeCompare(String(b), "id-ID"));
  const tagOptions = tags.map((t) => t.name);

  if (!product) {
    return (
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Produk tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Produk</h1>
        <Link
          href="/admin/products"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <ProductCreateForm
        mode="edit"
        id={product.id}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        initial={{
          title: product.title,
          description: product.description,
          descriptionHtml: product.descriptionHtml,
          category: product.category,
          isFeatured: product.isFeatured,
          locationName: product.locationName,
          instagram: product.socialLink?.instagram ?? null,
          whatsapp: product.socialLink?.whatsapp ?? null,
          facebook: product.socialLink?.facebook ?? null,
          tags: product.tags.map((t) => t.tag.name),
          images: product.images.map((i) => ({ id: i.id, url: i.url })),
        }}
      />
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCreateForm } from "./product-form";

export const dynamic = "force-dynamic";

export default async function AdminProductNewPage() {
  const [categories, tags] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Tambah Produk</h1>
        <Link
          href="/admin/products"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <ProductCreateForm
        mode="create"
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
      />
    </div>
  );
}

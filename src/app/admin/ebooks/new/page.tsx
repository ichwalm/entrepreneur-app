import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EbookUploadForm } from "./upload-form";

export const dynamic = "force-dynamic";

export default async function AdminEbookNewPage() {
  const [categories, tags] = await Promise.all([
    prisma.ebook.findMany({
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.tag.findMany({
      select: { name: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const categoryOptions = categories
    .map((c) => c.category)
    .filter(Boolean)
    .sort((a, b) => String(a).localeCompare(String(b), "id-ID"));
  const tagOptions = tags.map((t) => t.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Upload E-Book</h1>
        <Link
          href="/admin/ebooks"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <EbookUploadForm
        mode="create"
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
      />
    </div>
  );
}

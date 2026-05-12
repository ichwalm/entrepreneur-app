import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EbookUploadForm } from "../../new/upload-form";

export const dynamic = "force-dynamic";

export default async function AdminEbookEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const [ebook, categories, tags] = await Promise.all([
    prisma.ebook.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
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
  if (!ebook) {
    return (
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        E-book tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit E-Book</h1>
        <Link
          href="/admin/ebooks"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <EbookUploadForm
        mode="edit"
        id={ebook.id}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        initial={{
          title: ebook.title,
          description: ebook.description,
          descriptionHtml: ebook.descriptionHtml,
          category: ebook.category,
          tags: ebook.tags.map((t) => t.tag.name),
          coverUrl: ebook.coverUrl,
          fileName: ebook.fileName,
        }}
      />
    </div>
  );
}

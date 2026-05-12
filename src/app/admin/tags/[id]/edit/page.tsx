import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TagForm } from "../../new/tag-form";

export const dynamic = "force-dynamic";

export default async function AdminTagEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const tag = await prisma.tag.findUnique({ where: { id } });

  if (!tag) {
    return (
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Tag tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Tag</h1>
        <Link
          href="/admin/tags"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <TagForm mode="edit" id={tag.id} initial={{ name: tag.name }} />
    </div>
  );
}


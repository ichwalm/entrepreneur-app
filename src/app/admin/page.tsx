import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [ebookCount, productCount, pendingComments] = await Promise.all([
    prisma.ebook.count(),
    prisma.product.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat title="E-Book" value={ebookCount} />
        <Stat title="Produk" value={productCount} />
        <Stat title="Komentar Pending" value={pendingComments} />
      </div>
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-4 text-sm text-foreground/70">
        Route /admin dan /api/admin diproteksi middleware dan hanya bisa diakses role ADMIN.
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-accent bg-background p-4">
      <div className="text-xs text-foreground/60">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}


import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteTagButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const tags = await prisma.tag.findMany({
    where: q
      ? {
          OR: [{ name: { contains: q } }, { slug: { contains: q } }],
        }
      : undefined,
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { products: true, ebooks: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Tag</h1>
        <Link
          href="/admin/tags/new"
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Tambah Tag
        </Link>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-xl border border-accent bg-accent/10 p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama/slug..."
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 md:col-span-3"
        />
        <button
          type="submit"
          className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
        >
          Filter
        </button>
        <div className="md:col-span-4">
          <Link
            href="/admin/tags"
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-accent">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent/20 text-xs text-foreground/70">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Dipakai</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id} className="border-t border-accent">
                <td className="px-4 py-3 font-semibold">{t.name}</td>
                <td className="px-4 py-3 text-foreground/70">{t.slug}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {t._count.products} produk · {t._count.ebooks} e-book
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/tags/${t.id}/edit`}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <DeleteTagButton id={t.id} />
                  </div>
                </td>
              </tr>
            ))}
            {tags.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-foreground/70"
                  colSpan={4}
                >
                  Belum ada tag.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}


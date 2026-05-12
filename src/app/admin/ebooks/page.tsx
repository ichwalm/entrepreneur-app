import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteEbookButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminEbooksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const category = typeof sp.category === "string" ? sp.category.trim() : "";

  const where = {
    ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
    ...(category ? { category } : {}),
  } as const;

  const ebooks = await prisma.ebook.findMany({
    where,
    orderBy: { uploadedAt: "desc" },
  });

  const categories = await prisma.ebook.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const categoryOptions = categories
    .map((c) => c.category)
    .filter(Boolean)
    .sort((a, b) => String(a).localeCompare(String(b), "id-ID"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Manajemen E-Book</h1>
        <Link
          href="/admin/ebooks/new"
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Upload E-Book
        </Link>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-xl border border-accent bg-accent/10 p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul/deskripsi..."
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 md:col-span-2"
        />
        <select
          name="category"
          defaultValue={category}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="">Semua kategori</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            Filter
          </button>
          <Link
            href="/admin/ebooks"
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
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ebooks.map((e) => (
              <tr key={e.id} className="border-t border-accent">
                <td className="px-4 py-3">{e.title}</td>
                <td className="px-4 py-3 text-foreground/70">{e.category}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {new Date(e.uploadedAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/ebooks/${e.id}`}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Lihat
                    </Link>
                    <Link
                      href={`/admin/ebooks/${e.id}/edit`}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <DeleteEbookButton id={e.id} />
                  </div>
                </td>
              </tr>
            ))}
            {ebooks.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-foreground/70"
                  colSpan={4}
                >
                  Belum ada e-book.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

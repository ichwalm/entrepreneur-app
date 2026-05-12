import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteProductButton } from "./delete-button";
import { ProductStatusActions } from "./status-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const featured = typeof sp.featured === "string" ? sp.featured : "";
  const category = typeof sp.category === "string" ? sp.category.trim() : "";
  const statusRaw = typeof sp.status === "string" ? sp.status.trim() : "";
  const status = (() => {
    if (statusRaw === "PENDING") return "PENDING" as const;
    if (statusRaw === "APPROVED") return "APPROVED" as const;
    if (statusRaw === "REJECTED") return "REJECTED" as const;
    return null;
  })();

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { locationName: { contains: q } },
          ],
        }
      : {}),
    ...(featured === "true" ? { isFeatured: true } : {}),
    ...(featured === "false" ? { isFeatured: false } : {}),
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
  } as const;

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: { images: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    where: { category: { not: null } },
  });

  const categoryOptions = categories
    .map((c) => c.category)
    .filter((c): c is string => !!c)
    .sort((a, b) => String(a).localeCompare(String(b), "id-ID"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manajemen Produk
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Tambah Produk
        </Link>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-xl border border-accent bg-accent/10 p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul/deskripsi/alamat..."
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 md:col-span-2"
        />
        <select
          name="featured"
          defaultValue={featured}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="">Semua</option>
          <option value="true">Featured</option>
          <option value="false">Non-featured</option>
        </select>
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
        <select
          name="status"
          defaultValue={status ?? ""}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="">Semua status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <div className="md:col-span-4">
          <button
            type="submit"
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            Filter
          </button>
          <Link
            href="/admin/products"
            className="ml-2 rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
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
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Alamat</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-accent">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3">
                  <ProductStatusActions id={p.id} status={p.status} />
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.category ?? "-"}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.locationName ?? "-"}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {new Date(p.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/products/${p.id}`}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Lihat
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-foreground/70"
                  colSpan={6}
                >
                  Belum ada produk.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

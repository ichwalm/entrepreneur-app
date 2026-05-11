import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteProductButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manajemen Produk
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          Tambah Produk
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-accent">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent/20 text-xs text-foreground/70">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-accent">
                <td className="px-4 py-3">{p.title}</td>
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
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-foreground/70"
                  colSpan={4}
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

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeletePromoButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const active = typeof sp.active === "string" ? sp.active : "";

  const where = {
    ...(q
      ? {
          OR: [
            { code: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
    ...(active === "true" ? { isActive: true } : {}),
    ...(active === "false" ? { isActive: false } : {}),
  } as const;

  const promos = await prisma.promoCode.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { expiresAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Promo Codes</h1>
        <Link
          href="/admin/promos/new"
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Tambah Promo
        </Link>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-xl border border-accent bg-accent/10 p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari code/deskripsi..."
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 md:col-span-2"
        />
        <select
          name="active"
          defaultValue={active}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="">Semua</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
        >
          Filter
        </button>
        <div className="md:col-span-4">
          <Link
            href="/admin/promos"
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            Reset
          </Link>
          <span className="ml-3 text-xs text-foreground/60">{promos.length} item</span>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-accent">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent/20 text-xs text-foreground/70">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Diskon</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Kadaluarsa</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-t border-accent">
                <td className="px-4 py-3 font-semibold">{p.code}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.percentOff ? `${p.percentOff}%` : "-"}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.isActive ? "Aktif" : "Nonaktif"}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("id-ID") : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/promos/${p.id}/edit`}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <DeletePromoButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {promos.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-foreground/70"
                  colSpan={5}
                >
                  Belum ada promo code.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

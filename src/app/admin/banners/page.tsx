import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DeleteBannerButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage({
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
          OR: [{ title: { contains: q } }, { subtitle: { contains: q } }],
        }
      : {}),
    ...(active === "true" ? { isActive: true } : {}),
    ...(active === "false" ? { isActive: false } : {}),
  } as const;

  const banners = await prisma.banner.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Banner</h1>
        <Link
          href="/admin/banners/new"
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Tambah Banner
        </Link>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-xl border border-accent bg-accent/10 p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul/subjudul..."
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
            href="/admin/banners"
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            Reset
          </Link>
          <span className="ml-3 text-xs text-foreground/60">
            {banners.length} item
          </span>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-accent">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent/20 text-xs text-foreground/70">
            <tr>
              <th className="px-4 py-3">Banner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id} className="border-t border-accent">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-accent bg-accent/10">
                      {b.imageUrl ? (
                        <Image
                          src={b.imageUrl}
                          alt={b.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{b.title}</div>
                      {b.subtitle ? (
                        <div className="line-clamp-1 text-xs text-foreground/60">
                          {b.subtitle}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {b.isActive ? "Aktif" : "Nonaktif"}
                </td>
                <td className="px-4 py-3 text-foreground/70">{b.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/banners/${b.id}/edit`}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Edit
                    </Link>
                    <DeleteBannerButton id={b.id} />
                  </div>
                </td>
              </tr>
            ))}
            {banners.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-foreground/70"
                  colSpan={4}
                >
                  Belum ada banner.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

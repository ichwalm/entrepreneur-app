import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const rangeRaw = typeof sp.range === "string" ? sp.range : "";
  const range = rangeRaw === "7" || rangeRaw === "30" ? Number(rangeRaw) : 14;
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (range - 1));
  start.setHours(0, 0, 0, 0);

  const [
    ebookCount,
    productCount,
    pendingComments,
    pendingProducts,
    activeBanners,
    activePromos,
    tagCount,
  ] = await Promise.all([
    prisma.ebook.count(),
    prisma.product.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.banner.count({ where: { isActive: true } }),
    prisma.promoCode.count({ where: { isActive: true } }),
    prisma.tag.count(),
  ]);

  const [recentEbooks, recentProducts] = await Promise.all([
    prisma.ebook.findMany({
      where: { uploadedAt: { gte: start } },
      select: { uploadedAt: true },
    }),
    prisma.product.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
  ]);

  const [productCategories, ebookCategories] = await Promise.all([
    prisma.product.findMany({
      select: { category: true },
      where: { category: { not: null } },
    }),
    prisma.ebook.findMany({
      select: { category: true },
    }),
  ]);

  const topProductCategories = topCounts(
    productCategories.flatMap((r) => (r.category ? [r.category] : [])),
  );
  const topEbookCategories = topCounts(ebookCategories.map((r) => r.category));

  const days = Array.from({ length: range }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const ebookSeries = days.map((d) => {
    const day = d.toDateString();
    return recentEbooks.filter((e) => new Date(e.uploadedAt).toDateString() === day)
      .length;
  });
  const productSeries = days.map((d) => {
    const day = d.toDateString();
    return recentProducts.filter((p) => new Date(p.createdAt).toDateString() === day)
      .length;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat title="E-Book" value={ebookCount} />
        <Stat title="Produk" value={productCount} />
        <Stat title="Produk Pending" value={pendingProducts} />
        <Stat title="Komentar Pending" value={pendingComments} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat title="Banner Aktif" value={activeBanners} />
        <Stat title="Promo Aktif" value={activePromos} />
        <Stat title="Total Tag" value={tagCount} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-foreground/60">Range:</span>
        <RangeChip active={range === 7} href="/admin?range=7" label="7 hari" />
        <RangeChip active={range === 14} href="/admin?range=14" label="14 hari" />
        <RangeChip active={range === 30} href="/admin?range=30" label="30 hari" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Chart
          title={`Produk (${range} hari)`}
          subtitle="Jumlah produk dibuat per hari"
          series={productSeries}
        />
        <Chart
          title={`E-Book (${range} hari)`}
          subtitle="Jumlah e-book diunggah per hari"
          series={ebookSeries}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryCard
          title="Top kategori produk"
          rows={topProductCategories}
          emptyText="Belum ada kategori produk."
        />
        <CategoryCard
          title="Top kategori e-book"
          rows={topEbookCategories}
          emptyText="Belum ada kategori e-book."
        />
      </div>
    </div>
  );
}

function RangeChip(props: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={props.href}
      className={
        props.active
          ? "rounded-full bg-brand px-3 py-1 text-xs font-semibold text-black"
          : "rounded-full border border-accent px-3 py-1 text-xs text-foreground/80 hover:bg-accent"
      }
      aria-current={props.active ? "page" : undefined}
    >
      {props.label}
    </a>
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

function Chart(props: { title: string; subtitle: string; series: number[] }) {
  const max = Math.max(1, ...props.series);
  const points = props.series.map((v, i) => ({ i, v, h: Math.round((v / max) * 48) }));

  return (
    <div className="rounded-xl border border-accent bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{props.title}</div>
          <div className="mt-1 text-xs text-foreground/60">{props.subtitle}</div>
        </div>
        <div className="text-xs text-foreground/60">max {max}/hari</div>
      </div>

      <div className="mt-4 flex items-end gap-1.5">
        {points.map((p) => (
          <div
            key={p.i}
            className="flex-1 rounded-sm bg-accent/40"
            style={{ height: `${Math.max(2, p.h)}px` }}
            aria-label={`hari-${p.i + 1}: ${p.v}`}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard(props: {
  title: string;
  rows: Array<{ label: string; count: number }>;
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-accent bg-background p-4">
      <div className="text-sm font-semibold">{props.title}</div>
      {props.rows.length === 0 ? (
        <div className="mt-3 text-sm text-foreground/70">{props.emptyText}</div>
      ) : (
        <div className="mt-3 space-y-2">
          {props.rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2 text-sm"
            >
              <div className="min-w-0 truncate">{r.label}</div>
              <div className="text-xs text-foreground/60">{r.count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function topCounts(items: string[]) {
  const counts = new Map<string, number>();
  for (const v of items) {
    const key = v.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id-ID"))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
}

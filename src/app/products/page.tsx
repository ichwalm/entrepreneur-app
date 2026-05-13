import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type ProductListItem = Prisma.ProductGetPayload<{
  include: { images: true; tags: { include: { tag: true } } };
}>;

function getStringParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
) {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

function clampInt(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function buildHref(basePath: string, params: Record<string, string>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);

  const q = getStringParam(sp, "q").trim();
  const category = getStringParam(sp, "category").trim();
  const tag = getStringParam(sp, "tag").trim();
  const sortRaw = getStringParam(sp, "sort").trim();
  const sort =
    sortRaw === "oldest" || sortRaw === "updated" || sortRaw === "featured"
      ? sortRaw
      : "newest";

  const perPage = 12;
  const pageRaw = Number.parseInt(getStringParam(sp, "page") || "1", 10);
  const requestedPage = Number.isFinite(pageRaw) ? pageRaw : 1;

  const where: Prisma.ProductWhereInput = {
    status: "APPROVED",
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { locationName: { contains: q } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "featured"
      ? [{ isFeatured: "desc" }, { updatedAt: "desc" }]
      : sort === "updated"
        ? [{ updatedAt: "desc" }]
        : sort === "oldest"
          ? [{ createdAt: "asc" }]
          : [{ createdAt: "desc" }];

  const [total, categories, tags] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      where: { status: "APPROVED", category: { not: null } },
    }),
    prisma.tag.findMany({
      select: { slug: true, name: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = clampInt(requestedPage, 1, totalPages);
  const skip = (page - 1) * perPage;

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: perPage,
    include: {
      images: { take: 1, orderBy: { createdAt: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  const categoryOptions = categories
    .map((c) => c.category)
    .filter((c): c is string => !!c)
    .sort((a, b) => String(a).localeCompare(String(b), "id-ID"));

  const queryBase = {
    ...(q ? { q } : {}),
    ...(category ? { category } : {}),
    ...(tag ? { tag } : {}),
    ...(sort !== "newest" ? { sort } : {}),
  } satisfies Record<string, string>;

  const prevHref =
    page > 1 ? buildHref("/products", { ...queryBase, page: String(page - 1) }) : null;
  const nextHref =
    page < totalPages
      ? buildHref("/products", { ...queryBase, page: String(page + 1) })
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Produk</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Cari, filter, dan urutkan produk berdasarkan kategori/tag.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Ajukan Produk
        </Link>
      </div>

      <form className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-accent bg-accent/10 p-4 md:grid-cols-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul/deskripsi/lokasi..."
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
        <select
          name="tag"
          defaultValue={tag}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="">Semua tag</option>
          {tags.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="updated">Terakhir update</option>
          <option value="featured">Featured dulu</option>
        </select>
        <input type="hidden" name="page" value="1" />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black hover:opacity-90 md:col-span-5"
        >
          Terapkan Filter
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/70">
        <div>
          Menampilkan{" "}
          <span className="font-semibold text-foreground">
            {products.length === 0 ? 0 : skip + 1}–{skip + products.length}
          </span>{" "}
          dari <span className="font-semibold text-foreground">{total}</span> produk
        </div>
        <div>
          Halaman{" "}
          <span className="font-semibold text-foreground">
            {page}/{totalPages}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-accent bg-accent/10 px-4 py-8 text-sm text-foreground/70">
          Tidak ada produk yang cocok dengan filter.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as ProductListItem} />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        {prevHref ? (
          <Link
            href={prevHref}
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            ← Sebelumnya
          </Link>
        ) : (
          <div />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            Berikutnya →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-3xl border border-accent bg-background hover:bg-accent/10"
    >
      <div className="relative h-44 w-full border-b border-accent bg-accent/10">
        {product.images[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand/25 via-accent/20 to-brand2/20" />
        )}
        {product.isFeatured ? (
          <div className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-black">
            Featured
          </div>
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{product.title}</div>
            {product.category ? (
              <div className="mt-1 text-xs text-foreground/60">{product.category}</div>
            ) : null}
          </div>
          <div className="rounded-full border border-accent bg-accent/10 px-3 py-1 text-xs text-foreground/80">
            Lihat
          </div>
        </div>
        <div className="mt-3 line-clamp-2 text-sm text-foreground/75">
          {product.description}
        </div>
        {product.locationName ? (
          <div className="mt-3 text-xs text-foreground/60">{product.locationName}</div>
        ) : null}
        {product.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((t) => (
              <span
                key={t.tagId}
                className="rounded-full border border-accent px-2 py-0.5 text-[11px] text-foreground/70"
              >
                {t.tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}


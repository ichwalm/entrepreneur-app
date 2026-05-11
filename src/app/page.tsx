import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Ebook, Product, ProductImage } from "@prisma/client";

export const dynamic = "force-dynamic";

export default function Home() {
  const ebooksPromise = prisma.ebook.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 12,
  });
  const productsPromise = prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { images: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Platform Kewirausahaan
        </h1>
        <p className="max-w-2xl text-sm text-foreground/70">
          Jelajahi materi e-book kewirausahaan dan promosi produk UMKM. Pengunjung
          dapat melihat konten tanpa login; login diperlukan untuk download e-book.
        </p>
      </section>

      <section id="ebooks" className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">E-Book</h2>
        </div>
        <EbookGrid promise={ebooksPromise} />
      </section>

      <section id="produk" className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Promosi Produk</h2>
        </div>
        <ProductGrid promise={productsPromise} />
      </section>
    </div>
  );
}

async function EbookGrid({
  promise,
}: {
  promise: ReturnType<typeof prisma.ebook.findMany>;
}) {
  const ebooks = (await promise) as Ebook[];
  if (ebooks.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Belum ada e-book. Admin dapat menambahkan lewat dashboard.
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ebooks.map((e) => (
        <Link
          key={e.id}
          href={`/ebooks/${e.id}`}
          className="group rounded-xl border border-accent bg-background p-4 hover:bg-accent/10"
        >
          <div className="flex gap-4">
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-accent bg-accent/10">
              {e.coverUrl ? (
                <Image
                  src={e.coverUrl}
                  alt={e.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{e.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-foreground/70">
                {e.description}
              </div>
              <div className="mt-2 text-[11px] text-foreground/60">
                {e.category} •{" "}
                {new Date(e.uploadedAt).toLocaleDateString("id-ID")}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function ProductGrid({
  promise,
}: {
  promise: ReturnType<typeof prisma.product.findMany>;
}) {
  const products = (await promise) as Array<Product & { images: ProductImage[] }>;
  if (products.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Belum ada produk yang dipromosikan.
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.id}`}
          className="group overflow-hidden rounded-xl border border-accent bg-background hover:bg-accent/10"
        >
          <div className="relative h-44 w-full border-b border-accent bg-accent/10">
            {p.images[0]?.url ? (
              <Image
                src={p.images[0].url}
                alt={p.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="p-4">
            <div className="truncate text-sm font-medium">{p.title}</div>
            <div className="mt-1 line-clamp-2 text-xs text-foreground/70">
              {p.description}
            </div>
            {p.locationName ? (
              <div className="mt-2 text-[11px] text-foreground/60">
                {p.locationName}
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

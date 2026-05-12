import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <aside className="w-full shrink-0 rounded-xl border border-accent p-4 md:w-64">
          <div className="text-sm font-semibold tracking-tight">Admin</div>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-foreground/80">
            <Link href="/admin" className="rounded-lg px-2 py-1.5 hover:bg-accent">
              Ringkasan
            </Link>
            <Link
              href="/admin/ebooks"
              className="rounded-lg px-2 py-1.5 hover:bg-accent"
            >
              E-Book
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg px-2 py-1.5 hover:bg-accent"
            >
              Produk
            </Link>
            <Link
              href="/admin/banners"
              className="rounded-lg px-2 py-1.5 hover:bg-accent"
            >
              Banner
            </Link>
            <Link
              href="/admin/promos"
              className="rounded-lg px-2 py-1.5 hover:bg-accent"
            >
              Promo Codes
            </Link>
            <Link
              href="/admin/tags"
              className="rounded-lg px-2 py-1.5 hover:bg-accent"
            >
              Tag
            </Link>
            <Link
              href="/admin/comments"
              className="rounded-lg px-2 py-1.5 hover:bg-accent"
            >
              Moderasi Komentar
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

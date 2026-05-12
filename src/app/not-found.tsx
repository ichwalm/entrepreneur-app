import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="rounded-3xl border border-accent bg-accent/10 p-8">
        <div className="text-sm font-semibold text-foreground/80">404</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-sm leading-7 text-foreground/75">
          Link yang kamu buka tidak tersedia atau sudah dipindahkan.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black"
          >
            Kembali ke Home
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
          >
            Dashboard Admin
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-2xl px-4 py-16">
          <div className="rounded-2xl border border-accent bg-accent/10 p-6">
            <div className="text-sm font-semibold">Terjadi kesalahan</div>
            <div className="mt-2 text-sm text-foreground/75">
              {error.message || "Sistem mengalami masalah. Silakan coba lagi."}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black"
              >
                Coba Lagi
              </button>
              <Link
                href="/"
                className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
              >
                Kembali ke Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


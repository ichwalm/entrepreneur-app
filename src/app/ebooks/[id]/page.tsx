import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EbookDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const ebook = await prisma.ebook.findUnique({ where: { id } });
  if (!ebook) return notFoundView();

  const session = await getServerSession(authOptions);
  const canDownload = !!session?.user;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative h-64 w-44 shrink-0 overflow-hidden rounded-xl border border-accent bg-accent/10">
          {ebook.coverUrl ? (
            <Image
              src={ebook.coverUrl}
              alt={ebook.title}
              fill
              sizes="176px"
              className="object-cover"
              priority
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-foreground/60">{ebook.category}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {ebook.title}
          </h1>
          <div className="mt-2 text-sm text-foreground/70">
            Upload: {new Date(ebook.uploadedAt).toLocaleDateString("id-ID")}
          </div>

          <p className="mt-6 whitespace-pre-wrap text-sm text-foreground/85">
            {ebook.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {canDownload ? (
              <a
                href={`/api/ebooks/${ebook.id}/download`}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                Download
              </a>
            ) : (
              <Link
                href={`/login?callbackUrl=/ebooks/${ebook.id}`}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                Login untuk Download
              </Link>
            )}
            <Link
              href="/"
              className="rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function notFoundView() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        E-book tidak ditemukan.
      </div>
    </div>
  );
}


import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CommentsSection } from "./comments-section";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { createdAt: "asc" } },
      socialLink: true,
    },
  });
  if (!product) return notFoundView();

  const comments = await prisma.comment.findMany({
    where: { productId: id, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          {product.locationName ? (
            <div className="mt-2 text-sm text-foreground/70">
              {product.locationName}
            </div>
          ) : null}
        </div>
        <Link
          href="/"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-video overflow-hidden rounded-xl border border-accent bg-accent/10"
              >
                <Image
                  src={img.url}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
            ))}
            {product.images.length === 0 ? (
              <div className="rounded-xl border border-accent bg-accent/10 px-4 py-10 text-sm text-foreground/70">
                Tidak ada gambar.
              </div>
            ) : null}
          </div>

          <div className="mt-8 rounded-xl border border-accent bg-background p-5">
            <div className="text-sm font-semibold">Deskripsi</div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/85">
              {product.description}
            </p>
          </div>

          <div className="mt-8">
            <CommentsSection productId={product.id} initialComments={comments} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-accent bg-background p-5">
            <div className="text-sm font-semibold">Alamat</div>
            {product.locationName ? (
              <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/70">
                {product.locationName}
              </div>
            ) : (
              <div className="mt-2 text-sm text-foreground/70">
                Alamat belum diisi.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-accent bg-background p-5">
            <div className="text-sm font-semibold">Social Media</div>
            <div className="mt-3 space-y-2 text-sm">
              {product.socialLink?.instagram ? (
                <a
                  href={product.socialLink.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block underline underline-offset-4"
                >
                  Instagram
                </a>
              ) : null}
              {product.socialLink?.whatsapp ? (
                <a
                  href={
                    product.socialLink.whatsapp.startsWith("http")
                      ? product.socialLink.whatsapp
                      : `https://wa.me/${product.socialLink.whatsapp.replaceAll(
                          "+",
                          "",
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block underline underline-offset-4"
                >
                  WhatsApp
                </a>
              ) : null}
              {product.socialLink?.facebook ? (
                <a
                  href={product.socialLink.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block underline underline-offset-4"
                >
                  Facebook
                </a>
              ) : null}
              {!product.socialLink?.instagram &&
              !product.socialLink?.whatsapp &&
              !product.socialLink?.facebook ? (
                <div className="text-foreground/70">Belum ada link.</div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function notFoundView() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Produk tidak ditemukan.
      </div>
    </div>
  );
}

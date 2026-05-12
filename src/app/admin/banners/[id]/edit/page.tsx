import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BannerForm } from "../../new/banner-form";

export const dynamic = "force-dynamic";

export default async function AdminBannerEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) {
    return (
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Banner tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Banner</h1>
        <Link
          href="/admin/banners"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>

      <BannerForm
        mode="edit"
        id={banner.id}
        initial={{
          title: banner.title,
          subtitle: banner.subtitle,
          linkUrl: banner.linkUrl,
          isActive: banner.isActive,
          sortOrder: banner.sortOrder,
          imageUrl: banner.imageUrl,
        }}
      />
    </div>
  );
}


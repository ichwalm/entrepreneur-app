import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PromoForm } from "../../new/promo-form";

export const dynamic = "force-dynamic";

export default async function AdminPromoEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) {
    return (
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Promo tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Promo</h1>
        <Link
          href="/admin/promos"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>

      <PromoForm
        mode="edit"
        id={promo.id}
        initial={{
          code: promo.code,
          description: promo.description,
          percentOff: promo.percentOff,
          isActive: promo.isActive,
          startsAt: promo.startsAt ? toLocalValue(promo.startsAt) : null,
          expiresAt: promo.expiresAt ? toLocalValue(promo.expiresAt) : null,
        }}
      />
    </div>
  );
}

function toLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}


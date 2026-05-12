import Link from "next/link";
import { PromoForm } from "./promo-form";

export const dynamic = "force-dynamic";

export default function AdminPromoNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Tambah Promo</h1>
        <Link
          href="/admin/promos"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <PromoForm mode="create" />
    </div>
  );
}


import Link from "next/link";
import { ProductCreateForm } from "./product-form";

export const dynamic = "force-dynamic";

export default function AdminProductNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Tambah Produk</h1>
        <Link
          href="/admin/products"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <ProductCreateForm />
    </div>
  );
}


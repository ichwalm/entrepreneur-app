"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteTagButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm("Hapus tag ini? Relasi pada produk/e-book juga akan terhapus.")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-60"
    >
      Hapus
    </button>
  );
}


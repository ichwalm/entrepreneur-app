"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PromoForm(props: {
  mode: "create" | "edit";
  id?: string;
  initial?: {
    code: string;
    description: string | null;
    percentOff: number | null;
    isActive: boolean;
    startsAt: string | null;
    expiresAt: string | null;
  };
}) {
  const router = useRouter();
  const [code, setCode] = useState(props.initial?.code ?? "");
  const [description, setDescription] = useState(props.initial?.description ?? "");
  const [percentOff, setPercentOff] = useState(
    props.initial?.percentOff != null ? String(props.initial.percentOff) : "",
  );
  const [isActive, setIsActive] = useState(props.initial?.isActive ?? true);
  const [startsAt, setStartsAt] = useState(props.initial?.startsAt ?? "");
  const [expiresAt, setExpiresAt] = useState(props.initial?.expiresAt ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        code,
        description: description || null,
        percentOff: percentOff ? Number(percentOff) : null,
        isActive,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const url =
        props.mode === "create"
          ? "/api/admin/promos"
          : `/api/admin/promos/${props.id}`;
      const method = props.mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Gagal menyimpan promo.";
        setError(msg);
        return;
      }

      router.push("/admin/promos");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Diskon (%)</label>
          <input
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            inputMode="numeric"
            placeholder="Contoh: 10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Deskripsi (opsional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 w-full resize-y rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Mulai (opsional)</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Berakhir (opsional)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground/80">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-white"
        />
        Aktif
      </label>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}


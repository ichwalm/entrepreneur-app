"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function BannerForm(props: {
  mode: "create" | "edit";
  id?: string;
  initial?: {
    title: string;
    subtitle: string | null;
    linkUrl: string | null;
    isActive: boolean;
    sortOrder: number;
    imageUrl: string | null;
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(props.initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(props.initial?.subtitle ?? "");
  const [linkUrl, setLinkUrl] = useState(props.initial?.linkUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(props.initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(props.initial?.isActive ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => {
    if (!image) return null;
    return URL.createObjectURL(image);
  }, [image]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("subtitle", subtitle);
      fd.set("linkUrl", linkUrl);
      fd.set("sortOrder", sortOrder);
      fd.set("isActive", isActive ? "true" : "false");
      if (image) fd.set("image", image);

      const url =
        props.mode === "create"
          ? "/api/admin/banners"
          : `/api/admin/banners/${props.id}`;
      const method = props.mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, body: fd });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Gagal menyimpan banner.";
        setError(msg);
        return;
      }

      router.push("/admin/banners");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Judul</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Urutan</label>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Subjudul</label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="min-h-24 w-full resize-y rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Link (opsional)</label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Gambar (opsional)</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
        <label className="flex items-center gap-2 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
          Aktif
        </label>

        <div className="flex items-center gap-3">
          {preview || props.initial?.imageUrl ? (
            <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-accent bg-accent/10">
              <Image
                src={preview ?? props.initial!.imageUrl!}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="text-xs text-foreground/60">Tidak ada gambar.</div>
          )}
        </div>
      </div>

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


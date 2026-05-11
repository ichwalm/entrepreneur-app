"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PreviewImage = { file: File; url: string };

export function ProductCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previews = useMemo<PreviewImage[]>(() => {
    return images.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }, [images]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      fd.set("locationName", locationName);
      if (instagram) fd.set("instagram", instagram);
      if (whatsapp) fd.set("whatsapp", whatsapp);
      if (facebook) fd.set("facebook", facebook);

      for (const img of images) fd.append("images", img);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: fd,
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Gagal menyimpan produk.";
        setError(msg);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          <label className="text-sm text-foreground/80">
            Gambar (JPG/PNG/WebP, max 5MB per file)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((p) => (
            <div
              key={p.url}
              className="relative aspect-square overflow-hidden rounded-xl border border-accent bg-accent/10"
            >
              <Image src={p.url} alt={p.file.name} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Deskripsi Detail</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-32 w-full resize-y rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Alamat</label>
        <input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Contoh: Jl. Merdeka No. 10, Bandung, Jawa Barat"
        />
      </div>

      <div className="rounded-xl border border-accent p-4">
        <div className="text-sm font-medium">Social Media</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs text-foreground/60">Instagram (URL)</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60">WhatsApp</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="62812xxxx atau https://wa.me/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60">Facebook (URL)</label>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="https://facebook.com/..."
            />
          </div>
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
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Produk"}
      </button>
    </form>
  );
}

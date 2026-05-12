"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/RichTextEditor";

type PreviewImage = { file: File; url: string };

export function ProductCreateForm(props: {
  mode?: "create" | "edit";
  id?: string;
  categoryOptions?: string[];
  tagOptions?: string[];
  initial?: {
    title: string;
    description: string;
    descriptionHtml: string | null;
    category: string | null;
    isFeatured: boolean;
    locationName: string | null;
    instagram: string | null;
    whatsapp: string | null;
    facebook: string | null;
    tags: string[];
    images: Array<{ id: string; url: string }>;
  };
}) {
  const router = useRouter();
  const mode = props.mode ?? "create";
  const [title, setTitle] = useState(props.initial?.title ?? "");
  const [description, setDescription] = useState(props.initial?.description ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(
    props.initial?.descriptionHtml ?? "",
  );
  const [category, setCategory] = useState(props.initial?.category ?? "");
  const [tags, setTags] = useState((props.initial?.tags ?? []).join(", "));
  const [isFeatured, setIsFeatured] = useState(props.initial?.isFeatured ?? false);
  const [locationName, setLocationName] = useState(props.initial?.locationName ?? "");
  const [instagram, setInstagram] = useState(props.initial?.instagram ?? "");
  const [whatsapp, setWhatsapp] = useState(props.initial?.whatsapp ?? "");
  const [facebook, setFacebook] = useState(props.initial?.facebook ?? "");

  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previews = useMemo<PreviewImage[]>(() => {
    return images.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }, [images]);

  function addTag(name: string) {
    const parts = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const lower = new Set(parts.map((p) => p.toLowerCase()));
    if (!lower.has(name.toLowerCase())) parts.push(name);
    setTags(parts.join(", "));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      if (descriptionHtml) fd.set("descriptionHtml", descriptionHtml);
      if (category) fd.set("category", category);
      if (tags) fd.set("tags", tags);
      fd.set("isFeatured", isFeatured ? "true" : "false");
      fd.set("locationName", locationName);
      if (instagram) fd.set("instagram", instagram);
      if (whatsapp) fd.set("whatsapp", whatsapp);
      if (facebook) fd.set("facebook", facebook);

      for (const img of images) fd.append("images", img);

      const endpoint =
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${props.id}`;
      const res = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
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
      {props.initial?.images?.length ? (
        <div className="space-y-2">
          <div className="text-xs text-foreground/60">Gambar saat ini</div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {props.initial.images.slice(0, 6).map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-accent bg-accent/10"
              >
                <Image src={img.url} alt="Existing" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Ringkasan</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 w-full resize-y rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Deskripsi Detail</label>
        <RichTextEditor
          value={descriptionHtml}
          onChange={setDescriptionHtml}
          placeholder="Tulis deskripsi produk dengan format (bold, list, link, dll)..."
        />
        <div className="text-xs text-foreground/60">
          Teks akan disanitasi sebelum disimpan.
        </div>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Kategori</label>
          <input
            list="product-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Contoh: Fashion, Kuliner, Jasa"
          />
          {props.categoryOptions?.length ? (
            <datalist id="product-categories">
              {props.categoryOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Tag (pisah koma)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Contoh: handmade, premium, lokal"
          />
          {props.tagOptions?.length ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {props.tagOptions.slice(0, 10).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className="rounded-full border border-accent px-2 py-0.5 text-[11px] text-foreground/70 hover:bg-accent"
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground/80">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="h-4 w-4 accent-white"
        />
        Tampilkan sebagai produk unggulan (featured)
      </label>

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

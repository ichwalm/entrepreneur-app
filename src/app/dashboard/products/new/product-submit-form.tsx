"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/RichTextEditor";

type PreviewImage = { file: File; url: string };

export function ProductSubmitForm(props: {
  categoryOptions: string[];
  tagOptions: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
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

  const descLen = description.trim().length;

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
      fd.set("locationName", locationName);
      if (instagram) fd.set("instagram", instagram);
      if (whatsapp) fd.set("whatsapp", whatsapp);
      if (facebook) fd.set("facebook", facebook);
      for (const img of images) fd.append("images", img);

      const res = await fetch("/api/products/submit", { method: "POST", body: fd });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Gagal mengirim pengajuan.";
        setError(msg);
        return;
      }
      router.push("/dashboard");
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
            className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
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
        <label className="text-sm text-foreground/80">Ringkasan</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-28 w-full resize-y rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
          required
          minLength={10}
        />
        <div className="text-xs text-foreground/60">
          Minimal 10 karakter ({descLen}/10).
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Deskripsi Detail</label>
        <RichTextEditor
          value={descriptionHtml}
          onChange={setDescriptionHtml}
          placeholder="Tulis deskripsi produk (list, bold, link, dll)..."
        />
        <div className="text-xs text-foreground/60">
          Konten akan disanitasi sebelum disimpan.
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Alamat</label>
        <input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Kategori</label>
          <input
            list="public-product-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Contoh: Fashion, Kuliner, Jasa"
          />
          <datalist id="public-product-categories">
            {props.categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Tag (pisah koma)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Contoh: handmade, premium, lokal"
          />
          {props.tagOptions.length ? (
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

      <div className="rounded-xl border border-accent p-4">
        <div className="text-sm font-medium">Social Media</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs text-foreground/60">Instagram (URL)</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60">WhatsApp</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="62812xxxx atau https://wa.me/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-foreground/60">Facebook (URL)</label>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? "Mengirim..." : "Kirim untuk Approval"}
      </button>
    </form>
  );
}

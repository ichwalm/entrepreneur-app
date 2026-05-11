"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function EbookUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const coverPreview = useMemo(() => {
    if (!cover) return null;
    return URL.createObjectURL(cover);
  }, [cover]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("File e-book wajib diunggah.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      fd.set("category", category);
      fd.set("file", file);
      if (cover) fd.set("cover", cover);

      const res = await fetch("/api/admin/ebooks", {
        method: "POST",
        body: fd,
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Upload gagal.";
        setError(msg);
        return;
      }
      router.push("/admin/ebooks");
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
          <label className="text-sm text-foreground/80">Kategori</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-28 w-full resize-y rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">
            File E-Book (PDF/EPUB, max 50MB)
          </label>
          <input
            type="file"
            accept=".pdf,.epub,application/pdf,application/epub+zip"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">
            Cover (opsional, JPG/PNG/WebP)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm"
          />
          {coverPreview ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-28 w-20 overflow-hidden rounded-lg border border-accent bg-accent/10">
                <Image
                  src={coverPreview}
                  alt="Preview cover"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-xs text-foreground/70">{cover?.name}</div>
            </div>
          ) : null}
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
        {loading ? "Mengunggah..." : "Upload"}
      </button>
    </form>
  );
}

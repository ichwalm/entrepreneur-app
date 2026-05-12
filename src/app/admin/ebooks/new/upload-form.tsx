"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/RichTextEditor";

export function EbookUploadForm(props?: {
  mode?: "create" | "edit";
  id?: string;
  categoryOptions?: string[];
  tagOptions?: string[];
  initial?: {
    title: string;
    description: string;
    descriptionHtml: string | null;
    category: string;
    tags: string[];
    coverUrl: string | null;
    fileName: string;
  };
}) {
  const router = useRouter();
  return (
    <InnerForm
      router={router}
      mode={props?.mode}
      id={props?.id}
      categoryOptions={props?.categoryOptions}
      tagOptions={props?.tagOptions}
      initial={props?.initial}
    />
  );
}

function InnerForm({
  router,
  mode = "create",
  id,
  categoryOptions,
  tagOptions,
  initial,
}: {
  router: ReturnType<typeof useRouter>;
  mode?: "create" | "edit";
  id?: string;
  categoryOptions?: string[];
  tagOptions?: string[];
  initial?: {
    title: string;
    description: string;
    descriptionHtml: string | null;
    category: string;
    tags: string[];
    coverUrl: string | null;
    fileName: string;
  };
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(initial?.descriptionHtml ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const coverPreview = useMemo(() => {
    if (!cover) return null;
    return URL.createObjectURL(cover);
  }, [cover]);

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
    if (mode === "create" && !file) {
      setError("File e-book wajib diunggah.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      if (descriptionHtml) fd.set("descriptionHtml", descriptionHtml);
      fd.set("category", category);
      if (tags) fd.set("tags", tags);
      if (file) fd.set("file", file);
      if (cover) fd.set("cover", cover);

      const endpoint = mode === "create" ? "/api/admin/ebooks" : `/api/admin/ebooks/${id}`;
      const res = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
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
            list="ebook-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
          {categoryOptions?.length ? (
            <datalist id="ebook-categories">
              {categoryOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          ) : null}
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

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Deskripsi (Rich Text)</label>
        <RichTextEditor
          value={descriptionHtml}
          onChange={setDescriptionHtml}
          placeholder="Tambahkan poin penting, list materi, link referensi, dll..."
        />
        <div className="text-xs text-foreground/60">
          Teks akan disanitasi sebelum disimpan.
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-foreground/80">Tag (pisah koma)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Contoh: bisnis, marketing, keuangan"
        />
        {tagOptions?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {tagOptions.slice(0, 10).map((t) => (
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
            required={mode === "create"}
          />
          {mode === "edit" ? (
            <div className="text-xs text-foreground/60">
              File saat ini: {initial?.fileName}
            </div>
          ) : null}
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
          ) : initial?.coverUrl ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-28 w-20 overflow-hidden rounded-lg border border-accent bg-accent/10">
                <Image src={initial.coverUrl} alt="Cover" fill className="object-cover" />
              </div>
              <div className="text-xs text-foreground/70">Cover saat ini</div>
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
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}

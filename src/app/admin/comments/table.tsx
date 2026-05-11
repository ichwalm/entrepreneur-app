"use client";

import { useState } from "react";

type PendingRow = {
  id: string;
  productId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string | null;
  content: string;
  createdAt: string | Date;
  product: { id: string; title: string };
};

export function ModerationTable({ initial }: { initial: PendingRow[] }) {
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "APPROVED" | "REJECTED" | "DELETE") {
    setError(null);
    const res =
      action === "DELETE"
        ? await fetch(`/api/admin/comments/${id}`, { method: "DELETE" })
        : await fetch(`/api/admin/comments/${id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: action }),
          });

    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        typeof data === "object" && data && "error" in data
          ? String((data as { error: unknown }).error)
          : "Aksi gagal.";
      setError(msg);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Tidak ada komentar pending.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-accent">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent/20 text-xs text-foreground/70">
            <tr>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Komentar</th>
              <th className="px-4 py-3">Pengirim</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-accent align-top">
                <td className="px-4 py-3">{r.product.title}</td>
                <td className="px-4 py-3">
                  <div className="whitespace-pre-wrap text-sm">{r.content}</div>
                  <div className="mt-2 text-xs text-foreground/60">
                    {typeof r.createdAt === "string"
                      ? new Date(r.createdAt).toLocaleString("id-ID")
                      : r.createdAt.toLocaleString("id-ID")}
                    {r.parentId ? ` • Reply ke ${r.parentId}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  <div>{r.authorName}</div>
                  {r.authorEmail ? (
                    <div className="text-xs text-foreground/60">
                      {r.authorEmail}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => act(r.id, "APPROVED")}
                      className="rounded-lg bg-foreground px-2 py-1 text-xs text-background"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => act(r.id, "REJECTED")}
                      className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => act(r.id, "DELETE")}
                      className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

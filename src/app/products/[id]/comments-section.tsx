"use client";

import { useMemo, useState } from "react";

type CommentLike = {
  id: string;
  parentId: string | null;
  authorName: string;
  content: string;
  createdAt: string | Date;
};

type CommentNode = CommentLike & { children: CommentNode[] };

function buildTree(comments: CommentLike[]) {
  const map = new Map<string, CommentNode>();
  for (const c of comments) {
    map.set(c.id, { ...c, children: [] });
  }
  const roots: CommentNode[] = [];
  for (const c of map.values()) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(c);
    } else {
      roots.push(c);
    }
  }
  return roots;
}

export function CommentsSection(props: {
  productId: string;
  initialComments: CommentLike[];
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tree = useMemo(() => buildTree(props.initialComments), [props.initialComments]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${props.productId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName,
          authorEmail: authorEmail || null,
          content,
          parentId: replyTo,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Gagal mengirim komentar.";
        setError(msg);
        return;
      }
      setAuthorName("");
      setAuthorEmail("");
      setContent("");
      setReplyTo(null);
      setMessage("Komentar terkirim dan menunggu moderasi admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-accent bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Komentar</div>
        <div className="text-xs text-foreground/60">Threaded + Moderasi</div>
      </div>

      <div className="mt-5 space-y-4">
        {tree.length === 0 ? (
          <div className="text-sm text-foreground/70">Belum ada komentar.</div>
        ) : (
          tree.map((c) => (
            <CommentItem key={c.id} node={c} depth={0} onReply={setReplyTo} />
          ))
        )}
      </div>

      <div className="mt-8 border-t border-accent pt-5">
        <div className="text-sm font-semibold">Tulis Komentar</div>
        {replyTo ? (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-accent bg-accent/10 px-3 py-2 text-xs text-foreground/70">
            Membalas komentar: {replyTo}
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="underline underline-offset-4"
            >
              Batal
            </button>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Nama"
              className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              required
            />
            <input
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="Email (opsional)"
              className="w-full rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              type="email"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Komentar..."
            className="min-h-24 w-full resize-y rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />

          {message ? (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
              {message}
            </div>
          ) : null}
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
            {loading ? "Mengirim..." : "Kirim Komentar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CommentItem(props: {
  node: CommentNode;
  depth: number;
  onReply: (id: string) => void;
}) {
  const date =
    typeof props.node.createdAt === "string"
      ? new Date(props.node.createdAt)
      : props.node.createdAt;

  return (
    <div className={props.depth > 0 ? "ml-6 border-l border-accent pl-4" : ""}>
      <div className="rounded-lg border border-accent bg-accent/10 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">{props.node.authorName}</div>
          <div className="text-xs text-foreground/60">
            {date.toLocaleDateString("id-ID")}
          </div>
        </div>
        <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">
          {props.node.content}
        </div>
        <button
          type="button"
          onClick={() => props.onReply(props.node.id)}
          className="mt-2 text-xs underline underline-offset-4"
        >
          Balas
        </button>
      </div>

      {props.node.children.length > 0 ? (
        <div className="mt-3 space-y-3">
          {props.node.children.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={Math.min(props.depth + 1, 4)}
              onReply={props.onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

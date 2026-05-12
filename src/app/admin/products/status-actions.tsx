"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductStatusActions(props: {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const color =
    props.status === "APPROVED"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
      : props.status === "REJECTED"
        ? "bg-red-500/15 text-red-200 border-red-500/30"
        : "bg-amber-500/15 text-amber-200 border-amber-500/30";

  async function setStatus(next: "PENDING" | "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      await fetch(`/api/admin/products/${props.id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full border px-2 py-0.5 text-xs ${color}`}>
        {props.status}
      </span>
      {props.status === "PENDING" ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStatus("APPROVED")}
            className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStatus("REJECTED")}
            className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-60"
          >
            Reject
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("PENDING")}
          className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent disabled:opacity-60"
        >
          Set Pending
        </button>
      )}
    </div>
  );
}


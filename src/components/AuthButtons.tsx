"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data } = useSession();

  if (!data?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg border border-accent px-3 py-1.5 text-sm hover:bg-accent"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-black hover:opacity-90"
        >
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {data.user.role === "ADMIN" ? (
        <Link
          href="/admin"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-black hover:opacity-90"
        >
          Dashboard
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg border border-accent px-3 py-1.5 text-sm hover:bg-accent"
      >
        Logout
      </button>
    </div>
  );
}

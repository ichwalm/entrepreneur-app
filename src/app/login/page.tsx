"use client";

import { useState } from "react";
import { signIn, type SignInResponse } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
      const typed = res as SignInResponse | undefined;
      if (typed?.error) setError("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-2xl border border-accent bg-accent/5">
        <Image
          src="/illustrations/login_illustration.png"
          alt="Secure Authentication"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="theme-illustration object-contain p-4 transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
      <p className="mt-2 text-base text-foreground/70">
        Login untuk download e-book atau akses dashboard admin (role ADMIN).
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-foreground/80">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-accent bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
}

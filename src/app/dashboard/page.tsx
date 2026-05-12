import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const items = await prisma.product.findMany({
    where: { submittedById: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-base text-foreground/75">
            Ajukan promosi produk. Status akan{" "}
            <span className="font-semibold">PENDING</span> sampai admin melakukan
            approval.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90"
        >
          Upload Promosi Produk
        </Link>
      </div>

      <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl border border-accent bg-accent/5">
        <Image
          src="/illustrations/dashboard_illustration.png"
          alt="Data Analytics Dashboard"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="theme-illustration object-contain p-4 transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>

      <div className="mt-8 rounded-xl border border-accent bg-accent/10 p-4">
        <div className="text-sm font-semibold">Riwayat Pengajuan</div>
        <div className="mt-3 overflow-hidden rounded-xl border border-accent bg-background">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/20 text-xs text-foreground/70">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-accent">
                  <td className="px-4 py-3 font-semibold">{p.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "APPROVED" ? (
                      <Link
                        href={`/products/${p.id}`}
                        className="rounded-lg border border-accent px-2 py-1 text-xs hover:bg-accent"
                      >
                        Lihat
                      </Link>
                    ) : (
                      <span className="text-xs text-foreground/60">Menunggu</span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-sm text-foreground/70"
                    colSpan={4}
                  >
                    Belum ada pengajuan.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge(props: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const color =
    props.status === "APPROVED"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
      : props.status === "REJECTED"
        ? "bg-red-500/15 text-red-200 border-red-500/30"
        : "bg-amber-500/15 text-amber-200 border-amber-500/30";
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${color}`}>{props.status}</span>;
}


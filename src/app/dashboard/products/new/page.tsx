import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductSubmitForm } from "./product-submit-form";

export const dynamic = "force-dynamic";

export default async function PublicProductSubmitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/products/new");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/products/new");
  }

  const [categories, tags] = await Promise.all([
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      where: { category: { not: null } },
    }),
    prisma.tag.findMany({
      select: { name: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const categoryOptions = categories
    .map((c) => c.category)
    .filter((c): c is string => !!c)
    .sort((a, b) => String(a).localeCompare(String(b), "id-ID"));
  const tagOptions = tags.map((t) => t.name);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Upload Promosi Produk</h1>
        <Link
          href="/dashboard"
          className="rounded-lg border border-accent px-3 py-2 text-sm hover:bg-accent"
        >
          Kembali
        </Link>
      </div>
      <p className="mt-2 text-base text-foreground/75">
        Setelah dikirim, promosi akan berstatus <span className="font-semibold">PENDING</span> dan
        menunggu approval admin.
      </p>
      <div className="mt-8 rounded-3xl border border-accent bg-accent/10 p-6">
        <ProductSubmitForm categoryOptions={categoryOptions} tagOptions={tagOptions} />
      </div>
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import { ModerationTable } from "./table";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const pending = await prisma.comment.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { product: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Moderasi Komentar</h1>
      <ModerationTable initial={pending} />
    </div>
  );
}


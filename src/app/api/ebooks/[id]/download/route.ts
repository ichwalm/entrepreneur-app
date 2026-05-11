import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
  const ebook = await prisma.ebook.findUnique({ where: { id } });
  if (!ebook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.redirect(ebook.fileUrl);
}

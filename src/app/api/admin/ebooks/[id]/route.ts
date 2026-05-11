import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({ action: "delete_ebook", limit: 20, windowMs: 60_000 });
    const { id } = await Promise.resolve(params);
    await prisma.ebook.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


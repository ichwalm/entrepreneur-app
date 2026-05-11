import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({ action: "moderate", limit: 30, windowMs: 60_000 });
    const { id } = await Promise.resolve(params);
    const body: unknown = await req.json().catch(() => null);
    const status =
      typeof body === "object" && body && "status" in body
        ? (body as { status: unknown }).status
        : undefined;
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }
    await prisma.comment.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({ action: "moderate", limit: 30, windowMs: 60_000 });
    const { id } = await Promise.resolve(params);
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

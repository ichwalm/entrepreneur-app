import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { promoCodeSchema } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({ action: "promo", limit: 50, windowMs: 60_000 });
    const { id } = await Promise.resolve(params);
    const body = (await req.json().catch(() => null)) as unknown;

    const parsed = promoCodeSchema.parse(body);
    const code = sanitizeText(parsed.code).toUpperCase();
    const description = parsed.description ? sanitizeText(parsed.description) : null;
    const percentOff = parsed.percentOff ?? null;
    const isActive = parsed.isActive ?? true;
    const startsAt = parsed.startsAt ? new Date(parsed.startsAt) : null;
    const expiresAt = parsed.expiresAt ? new Date(parsed.expiresAt) : null;

    await prisma.promoCode.update({
      where: { id },
      data: { code, description, percentOff, isActive, startsAt, expiresAt },
    });

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
    await rateLimitOrThrow({ action: "promo", limit: 50, windowMs: 60_000 });
    const { id } = await Promise.resolve(params);
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({
      action: "product_status",
      limit: 120,
      windowMs: 60_000,
    });

    const { id } = await Promise.resolve(ctx.params);
    const body = (await req.json().catch(() => null)) as unknown;
    const parsed = bodySchema.parse(body);

    await prisma.product.update({
      where: { id },
      data: {
        status: parsed.status,
        ...(parsed.status === "APPROVED" ? {} : { isFeatured: false }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


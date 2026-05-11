import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { commentCreateSchema } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    await rateLimitOrThrow({ action: "comment", limit: 8, windowMs: 60_000 });
    const { id: productId } = await Promise.resolve(params);
    const body = await req.json();
    const parsed = commentCreateSchema.parse(body);

    const authorName = sanitizeText(parsed.authorName);
    const authorEmail = parsed.authorEmail ? sanitizeText(parsed.authorEmail) : null;
    const content = sanitizeText(parsed.content);

    let parentId: string | null = parsed.parentId ?? null;
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.productId !== productId) parentId = null;
    }

    await prisma.comment.create({
      data: {
        productId,
        parentId,
        authorName,
        authorEmail,
        content,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


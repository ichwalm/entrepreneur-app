import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { tagSchema } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { toSlug } from "@/lib/tags";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({ action: "tag", limit: 60, windowMs: 60_000 });
    const body = (await req.json().catch(() => null)) as unknown;
    const parsed = tagSchema.parse(body);
    const name = sanitizeText(parsed.name);
    const slug = toSlug(name);

    if (!slug) {
      return NextResponse.json({ error: "Nama tag tidak valid." }, { status: 400 });
    }

    const tag = await prisma.tag.create({ data: { name, slug } });
    return NextResponse.json({ ok: true, id: tag.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


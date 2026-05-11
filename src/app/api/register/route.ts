import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { registerSchema } from "@/lib/validators";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await rateLimitOrThrow({ action: "register", limit: 10, windowMs: 60_000 });
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const email = parsed.email.toLowerCase().trim();
    const name = sanitizeText(parsed.name);
    const passwordHash = await hash(parsed.password, 12);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 },
      );
    }

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "PUBLIC",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


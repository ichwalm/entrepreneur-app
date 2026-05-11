import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getClientKey() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const ua = h.get("user-agent") ?? "unknown";
  return `${ip}:${ua.slice(0, 40)}`;
}

export async function rateLimitOrThrow(opts: {
  action: string;
  limit: number;
  windowMs: number;
}) {
  const key = await getClientKey();
  const windowStartMs = Math.floor(Date.now() / opts.windowMs) * opts.windowMs;
  const windowStart = new Date(windowStartMs);

  const row = await prisma.rateLimit.upsert({
    where: {
      action_key_windowStart: {
        action: opts.action,
        key,
        windowStart,
      },
    },
    create: {
      action: opts.action,
      key,
      windowStart,
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
  });

  if (row.count > opts.limit) {
    throw new Error("Terlalu banyak permintaan. Coba lagi sebentar.");
  }
}

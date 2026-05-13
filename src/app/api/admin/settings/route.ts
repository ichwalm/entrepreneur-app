import { NextResponse } from "next/server";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { getHomepageSettings, updateHomepageSettings } from "@/lib/siteSettings";

export const runtime = "nodejs";

export async function GET() {
  try {
    await rateLimitOrThrow({ action: "settings_read", limit: 120, windowMs: 60_000 });
    const homepage = await getHomepageSettings();
    return NextResponse.json({ ok: true, homepage });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    await rateLimitOrThrow({ action: "settings_write", limit: 60, windowMs: 60_000 });
    const body = (await req.json().catch(() => null)) as unknown;
    const homepage = await updateHomepageSettings(body);
    return NextResponse.json({ ok: true, homepage });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { prisma } from "@/lib/prisma";

export function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)+/g, "");
}

export function parseTags(input: string | null | undefined) {
  if (!input) return [];
  const parts = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const unique = new Map<string, string>();
  for (const p of parts) {
    const name = p.slice(0, 40);
    const key = name.toLowerCase();
    if (!unique.has(key)) unique.set(key, name);
  }
  return Array.from(unique.values()).slice(0, 25);
}

export async function upsertTags(names: string[]) {
  const cleaned = names
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 25);

  const tags = await Promise.all(
    cleaned.map(async (name) => {
      const slug = toSlug(name);
      const existing = await prisma.tag.findFirst({
        where: { OR: [{ name }, { slug }] },
      });
      if (existing) return existing;
      return prisma.tag.create({ data: { name, slug } });
    }),
  );

  const byId = new Map(tags.map((t) => [t.id, t]));
  return Array.from(byId.values());
}

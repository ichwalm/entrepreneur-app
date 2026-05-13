import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

export const homepageSettingsSchema = z.object({
  heroBadge: z.string().min(1).max(120),
  heroTitle: z.string().min(1).max(180),
  heroDescription: z.string().min(1).max(2000),

  aboutEyebrow: z.string().min(1).max(40),
  aboutTitle: z.string().min(1).max(180),
  aboutDescription: z.string().min(1).max(3000),
  aboutTaglineTitle: z.string().min(1).max(200),
  aboutTaglineSubtitle: z.string().min(1).max(500),

  contactEyebrow: z.string().min(1).max(60),
  contactTitle: z.string().min(1).max(180),
  contactDescription: z.string().min(1).max(3000),
  contactEmail: z.string().email().max(190),
  contactWhatsapp: z.string().min(1).max(60),
  contactHours: z.string().min(1).max(80),
  footerText: z.string().min(1).max(200),
});

export const homepageSettingsPatchSchema = homepageSettingsSchema.partial();

export type HomepageSettings = z.infer<typeof homepageSettingsSchema>;

export const defaultHomepageSettings: HomepageSettings = {
  heroBadge: "Profil usaha modern + promosi produk",
  heroTitle: "Bangun brand. Promosikan produk. Tumbuh lebih cepat.",
  heroDescription:
    "Website entrepreneur untuk menampilkan identitas, produk unggulan, materi e-book, dan sistem komentar dengan moderasi. Admin mengelola konten, pengunjung menikmati pengalaman yang cepat dan rapi.",

  aboutEyebrow: "ABOUT US",
  aboutTitle: "Identitas brand yang kuat, pengalaman yang clean.",
  aboutDescription:
    "Kami membantu entrepreneur menyajikan profil usaha yang modern, rapi, dan konsisten. Konten dikelola lewat dashboard admin yang aman, dan pengunjung mendapatkan experience cepat serta mudah diakses di semua perangkat.",
  aboutTaglineTitle: "“From idea to market — faster.”",
  aboutTaglineSubtitle:
    "Tampilkan produk terbaikmu dengan visual konsisten dan copywriting yang fokus pada nilai.",

  contactEyebrow: "CALL TO ACTION",
  contactTitle: "Siap promosikan produkmu hari ini?",
  contactDescription:
    "Admin dapat menambahkan produk, banner promo, dan kode promo untuk meningkatkan konversi. Hubungi kami untuk penempatan produk unggulan.",
  contactEmail: "hello@example.com",
  contactWhatsapp: "+62 812-xxxx-xxxx",
  contactHours: "09.00–17.00",
  footerText: "Entrepreneur Platform. All rights reserved.",
};

function sanitizeHomepageSettings(input: Partial<HomepageSettings>) {
  const out: Partial<HomepageSettings> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string") continue;
    out[key as keyof HomepageSettings] = sanitizeText(value);
  }
  return out;
}

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "homepage" } });
  if (!row) return defaultHomepageSettings;
  const parsed = homepageSettingsSchema.safeParse(row.value);
  return parsed.success ? parsed.data : defaultHomepageSettings;
}

export async function updateHomepageSettings(patch: unknown): Promise<HomepageSettings> {
  const parsedPatch = homepageSettingsPatchSchema.parse(patch);
  const sanitizedPatch = sanitizeHomepageSettings(parsedPatch);
  const current = await getHomepageSettings();
  const merged = homepageSettingsSchema.parse({ ...current, ...sanitizedPatch });

  await prisma.siteSetting.upsert({
    where: { key: "homepage" },
    create: { key: "homepage", value: merged },
    update: { value: merged },
  });

  return merged;
}

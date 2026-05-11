import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(190),
  password: z.string().min(8).max(200),
});

export const ebookCreateSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(5000),
  category: z.string().min(2).max(80),
});

export const productCreateSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(10000),
  locationName: z.string().max(200).optional().nullable(),
  instagram: z.string().url().max(500).optional().nullable(),
  whatsapp: z.string().max(200).optional().nullable(),
  facebook: z.string().url().max(500).optional().nullable(),
});

export const commentCreateSchema = z.object({
  authorName: z.string().min(2).max(80),
  authorEmail: z.string().email().max(190).optional().nullable(),
  content: z.string().min(2).max(2000),
  parentId: z.string().optional().nullable(),
});

export function assertFileOk(
  file: File,
  opts: { maxBytes: number; allowedMime: string[]; allowedExt: string[] },
) {
  if (!opts.allowedMime.includes(file.type)) {
    throw new Error("Format file tidak didukung.");
  }
  if (file.size > opts.maxBytes) {
    throw new Error("Ukuran file melebihi batas.");
  }
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (!opts.allowedExt.includes(ext)) {
    throw new Error("Ekstensi file tidak didukung.");
  }
}

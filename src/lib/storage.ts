import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export function getUploadRoot() {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "uploads");
}

async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
}

function safeExt(name: string) {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  return ext.replaceAll(/[^a-z0-9]/g, "");
}

export async function saveUploadToDisk(opts: {
  file: File;
  relativeDir: string;
  maxBytes: number;
  allowedMime: string[];
  allowedExt: string[];
}) {
  const { file } = opts;

  if (!opts.allowedMime.includes(file.type)) {
    throw new Error("Format file tidak didukung.");
  }
  if (file.size > opts.maxBytes) {
    throw new Error("Ukuran file melebihi batas.");
  }

  const ext = safeExt(file.name);
  if (!opts.allowedExt.includes(ext)) {
    throw new Error("Ekstensi file tidak didukung.");
  }

  const root = getUploadRoot();
  const dir = path.join(root, opts.relativeDir);
  await ensureDir(dir);

  const random = crypto.randomUUID();
  const storedName = `${Date.now()}-${random}.${ext}`;
  const absPath = path.join(dir, storedName);

  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buf);

  const relativePath = path.posix.join(
    opts.relativeDir.split(path.sep).join(path.posix.sep),
    storedName,
  );

  return {
    storedName,
    originalName: file.name,
    contentType: file.type,
    size: file.size,
    relativePath,
    absPath,
  };
}

export function resolveUploadPath(relativePath: string) {
  const root = getUploadRoot();
  const normalized = relativePath.replaceAll("\\", "/");
  const cleaned = normalized.replaceAll("../", "").replaceAll("..\\", "");
  return path.join(root, cleaned);
}


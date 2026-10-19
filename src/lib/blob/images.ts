import "server-only";
import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import {
  DATA_IMAGE_KIND,
  IMAGE_KINDS,
  IMAGE_UPLOAD,
  type AllowedImageType,
  type DataKey,
  type ImageKind,
} from "@/config/storage";
import { idSchema } from "@/lib/validation/common";

// Image files: images/{kind}/{entityId}/{uuid}.{ext}. The path is always generated here on
// the server — the user's original file name is never part of a storage key — and files are
// never overwritten.

const EXTENSION_TYPES: Record<string, AllowedImageType> = Object.fromEntries(
  Object.entries(IMAGE_UPLOAD.allowedTypes).map(([type, extensions]) => [extensions[0], type as AllowedImageType]),
);

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
export const IMAGE_PATHNAME_PATTERN = new RegExp(
  `^images/(${IMAGE_KINDS.join("|")})/([a-z0-9][a-z0-9-]*)/(${UUID})\\.(${Object.keys(EXTENSION_TYPES).join("|")})$`,
);

export type ParsedImagePathname = { kind: ImageKind; entityId: string; extension: string; contentType: AllowedImageType };

export function parseImagePathname(pathname: string): ParsedImagePathname | null {
  const match = IMAGE_PATHNAME_PATTERN.exec(pathname);
  if (!match) return null;
  const [, kind, entityId, , extension] = match;
  return { kind: kind as ImageKind, entityId, extension, contentType: EXTENSION_TYPES[extension] };
}

export function createImagePathname(kind: ImageKind, entityId: string, extension: string): string {
  const id = idSchema.parse(entityId);
  const pathname = `images/${kind}/${id}/${randomUUID()}.${extension}`;
  if (!parseImagePathname(pathname)) throw new Error(`Invalid image extension: ${extension}`);
  return pathname;
}

// Identifies the real format from the file's first bytes (never from the name or the
// declared content type).
export function detectImageType(bytes: Uint8Array): AllowedImageType | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp") {
    // ISO-BMFF: major brand at 8..12, compatible brands from 16 to the end of the ftyp box.
    const boxSize = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const brands = [ascii(8, 12)];
    for (let offset = 16; offset + 4 <= Math.min(boxSize, bytes.length); offset += 4) brands.push(ascii(offset, offset + 4));
    if (brands.includes("avif") || brands.includes("avis")) return "image/avif";
  }
  return null;
}

// Every image pathname referenced anywhere in a JSON value (ImageRef objects carry `pathname`).
export function collectImagePathnames(value: unknown, into = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectImagePathnames(item, into);
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.pathname === "string" && IMAGE_PATHNAME_PATTERN.test(record.pathname)) into.add(record.pathname);
    for (const item of Object.values(record)) collectImagePathnames(item, into);
  }
  return into;
}

// Best effort: a failed delete only leaves an orphan, which `npm run images:cleanup` removes.
export async function deleteImages(pathnames: Iterable<string>, reason: string): Promise<void> {
  const list = [...pathnames];
  if (list.length === 0) return;
  try {
    await del(list);
  } catch (error) {
    console.error(`[blob] failed to delete ${list.length} image(s) (${reason}); left for images:cleanup`, error);
  }
}

// Retention-aware image deletion, run after old content versions were pruned.
// An image is deleted only if a removed version referenced it AND no kept version of the
// document references it — so a rollback to any kept version still has all its images.
// Only images under the document's own kind are considered (documents never share images).
export async function deleteImagesDroppedByPrune(key: string, removed: unknown[], kept: unknown[]): Promise<string[]> {
  const kind = DATA_IMAGE_KIND[key as DataKey];
  if (!kind) return [];
  const prefix = `images/${kind}/`;
  const stillReferenced = new Set<string>();
  for (const document of kept) collectImagePathnames(document, stillReferenced);
  const dropped = [...collectImagePathnames(removed)].filter(
    (pathname) => pathname.startsWith(prefix) && !stillReferenced.has(pathname),
  );
  await deleteImages(dropped, `no kept version of ${key} references them`);
  return dropped;
}

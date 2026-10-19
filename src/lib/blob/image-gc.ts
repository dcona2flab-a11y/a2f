import "server-only";
import { list } from "@vercel/blob";
import { DATA_KEYS, ORPHAN_IMAGE_MIN_AGE_HOURS } from "@/config/storage";
import { collectImagePathnames, deleteImages } from "./images";
import { readAllDocumentVersions } from "./json-store";

// Orphan images: uploaded files that no kept version of any content document references
// (the content save never happened, was cancelled, or lost a version conflict).
// Only files older than the age threshold count, so uploads still being edited are safe.

export type OrphanImage = { pathname: string; uploadedAt: Date; size: number };

export async function findOrphanImages(minAgeHours = ORPHAN_IMAGE_MIN_AGE_HOURS) {
  const referenced = new Set<string>();
  for (const key of DATA_KEYS) {
    for (const stored of await readAllDocumentVersions(key)) collectImagePathnames(stored.document, referenced);
  }

  const cutoff = Date.now() - minAgeHours * 60 * 60 * 1000;
  const orphans: OrphanImage[] = [];
  let scanned = 0;
  let recentUnreferenced = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "images/", cursor, limit: 1000 });
    for (const blob of page.blobs) {
      scanned += 1;
      if (referenced.has(blob.pathname)) continue;
      if (blob.uploadedAt.getTime() > cutoff) {
        recentUnreferenced += 1;
        continue;
      }
      orphans.push({ pathname: blob.pathname, uploadedAt: blob.uploadedAt, size: blob.size });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return { scanned, referenced: referenced.size, recentUnreferenced, orphans };
}

export async function deleteOrphanImages(orphans: OrphanImage[]): Promise<void> {
  await deleteImages(
    orphans.map((orphan) => orphan.pathname),
    "orphan cleanup",
  );
}

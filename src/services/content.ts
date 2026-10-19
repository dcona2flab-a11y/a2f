import { revalidateTag, unstable_cache, updateTag } from "next/cache";
import { cache } from "react";
import { cacheTagFor, type DataKey } from "@/config/storage";
import { readDocument } from "@/lib/blob/json-store";
import type { ContentDocuments } from "@/lib/validation/content";

// Latest version of a document (with its version number) through the Next data cache, tagged
// per document. Public pages AND admin pages/actions read here, so a page view never calls the
// Blob API (list() is a billed "advanced operation"); only a cache miss after a save does.
// Every admin save calls refreshContent(), so the next read (admin or public) sees the new
// version at once. Conflicts stay safe without a fresh read: saveDocument() lists the versions
// itself and refuses a stale expectedVersion. Data written outside the admin (scripts) shows up
// only after the next admin save of that document.
//
// Server Actions use readCachedDocument() (data cache only): after refreshContent() the same
// action request must read the new version again, which a per-request memo would not do.
export function readCachedDocument<K extends DataKey>(key: K): Promise<ContentDocuments[K] | null> {
  return unstable_cache(
    async () => (await readDocument(key))?.document ?? null,
    ["content", key],
    { tags: [cacheTagFor(key)] },
  )();
}

// For rendering (pages, layouts, sitemap): also memoized per request (React cache), so a
// layout and a page that read the same key share one lookup.
export const getPublishedDocument = cache(readCachedDocument) as typeof readCachedDocument;

// From a Server Action: the admin's next render already sees the new content.
export function refreshContent(key: DataKey): void {
  updateTag(cacheTagFor(key));
}

// From a Route Handler (e.g. image upload callbacks), where updateTag is not allowed.
export function expireContent(key: DataKey): void {
  revalidateTag(cacheTagFor(key), { expire: 0 });
}

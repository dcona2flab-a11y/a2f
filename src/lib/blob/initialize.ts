import { DEFAULT_CONTENT } from "@/config/defaults";
import type { DataKey } from "@/config/storage";
import { readDocument, saveDocument, type StoredDocument } from "./json-store";

// Returns the latest document, creating version 1 from DEFAULT_CONTENT first if the document
// has never been saved. Creation goes through saveDocument with expected version 0, so the
// defaults are schema-validated and two simultaneous initializations cannot both write.
export async function ensureDocument<K extends DataKey>(key: K): Promise<StoredDocument<K>> {
  const existing = await readDocument(key);
  if (existing) return existing;

  await saveDocument(key, 0, DEFAULT_CONTENT[key]);
  // Whether this call or a concurrent one created it, version 1 now exists.
  const created = await readDocument(key);
  if (!created) throw new Error(`Failed to initialize ${key}`);
  return created;
}

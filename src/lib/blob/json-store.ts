import { DATA_HISTORY_LIMIT, DATA_IMAGE_KIND, type DataKey } from "@/config/storage";
import {
  documentSchemas,
  type ContentDocuments,
  type DocumentContent,
} from "@/lib/validation/content";
import { collectImagePathnames, deleteImagesDroppedByPrune } from "./images";
import {
  createVersionedStore,
  type DocumentVersion,
  type SaveResult as StoreSaveResult,
  type StoredDocument as StoreDocument,
} from "./versioned-store";

// Public site content (home, awards, projects, professor, members, settings) in the public
// Blob store. Mechanics: ./versioned-store.

export { VERSION_CONFLICT_MESSAGE, type DocumentVersion } from "./versioned-store";

const contentStore = createVersionedStore(documentSchemas, {
  access: "public",
  historyLimit: DATA_HISTORY_LIMIT,
  // Images leave storage only when no kept version references them any more (rollback-safe).
  onVersionsPruned: async (key, removed, kept) => {
    await deleteImagesDroppedByPrune(key, removed, kept);
  },
});

export type StoredDocument<K extends DataKey> = StoreDocument<ContentDocuments[K]>;
export type SaveResult<K extends DataKey> = StoreSaveResult<ContentDocuments[K]>;

// Newest first.
export function listDocumentVersions(key: DataKey): Promise<DocumentVersion[]> {
  return contentStore.listVersions(key);
}

// Every kept version, newest first (used by the orphan image scan).
export function readAllDocumentVersions<K extends DataKey>(key: K): Promise<StoredDocument<K>[]> {
  return contentStore.readAll(key) as Promise<StoredDocument<K>[]>;
}

// Latest version, or null if the document has never been saved.
export function readDocument<K extends DataKey>(key: K): Promise<StoredDocument<K> | null> {
  return contentStore.read(key) as Promise<StoredDocument<K> | null>;
}

export function readDocumentVersion<K extends DataKey>(key: K, version: number): Promise<StoredDocument<K> | null> {
  return contentStore.readVersion(key, version) as Promise<StoredDocument<K> | null>;
}

// Saves only if the latest stored version still equals the version the admin started editing.
export function saveDocument<K extends DataKey>(
  key: K,
  expectedVersion: number,
  content: DocumentContent<K>,
): Promise<SaveResult<K>> {
  assertOwnImages(key, content);
  return contentStore.save(key, expectedVersion, content as never) as Promise<SaveResult<K>>;
}

// A document may only reference images under its own kind (DATA_IMAGE_KIND). Retention-aware
// image deletion relies on this: it never has to check other documents' histories.
function assertOwnImages(key: DataKey, content: unknown): void {
  const kind = DATA_IMAGE_KIND[key];
  for (const pathname of collectImagePathnames(content)) {
    if (!kind || !pathname.startsWith(`images/${kind}/`)) {
      throw new Error(`${key} cannot reference image ${pathname}`);
    }
  }
}

// Rollback: saves the content of an older kept version as a new latest version.
export function restoreDocumentVersion<K extends DataKey>(
  key: K,
  fromVersion: number,
  expectedVersion: number,
): Promise<SaveResult<K>> {
  return contentStore.restore(key, fromVersion, expectedVersion) as Promise<SaveResult<K>>;
}

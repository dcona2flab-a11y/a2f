import { BlobNotFoundError, del, get, head, list, put } from "@vercel/blob";
import type { z } from "zod";
import { dataPrefix, dataVersionPath, parseDataVersion } from "@/config/storage";

// Versioned JSON documents in a Vercel Blob store (see config/storage for the layout and why
// nothing is overwritten).
//
// - Latest version = highest version number among the files listed under data/<key>/.
//   list() goes to the Blob API, so it reflects a save immediately; each version has its own
//   URL, so a public store's CDN can never return stale content for it.
// - A save creates data/<key>/v{n+1}.json with allowOverwrite:false. If two saves start from
//   the same version, only one create succeeds — the conflict check is atomic at the store.
// - After a save, versions beyond `historyLimit` are deleted. Kept versions are the rollback
//   window; a rollback saves an old version's content as a new version.
//
// One implementation serves both the public content store and the private admin-auth store;
// they differ only in StoreConfig.

export const VERSION_CONFLICT_MESSAGE =
  "다른 관리자가 데이터를 수정했습니다.\n최신 데이터를 다시 불러온 후 수정해주세요.";

export type StoreConfig = {
  access: "public" | "private";
  // Private stores live next to the public one, so their id must be passed explicitly.
  storeId?: () => string;
  historyLimit: number;
  // Called after old versions were deleted, with the removed versions' documents and every
  // document that is still kept (including the one just saved). Used to delete images that
  // no kept version references any more.
  onVersionsPruned?: (key: string, removed: unknown[], kept: unknown[]) => Promise<void>;
};

type Meta = { version: number; updatedAt: string };

export type DocumentVersion = {
  version: number;
  pathname: string;
  url: string;
  uploadedAt: Date;
};

export type StoredDocument<D> = { document: D; pathname: string };

export type SaveResult<D> =
  | { ok: true; document: D }
  | { ok: false; reason: "conflict"; message: string };

export function createVersionedStore<S extends Record<string, z.ZodType<Meta>>>(schemas: S, config: StoreConfig) {
  type Key = keyof S & string;
  type Doc<K extends Key> = z.infer<S[K]>;
  type Content<K extends Key> = Omit<Doc<K>, "version" | "updatedAt">;

  const blobOptions = () => (config.storeId ? { storeId: config.storeId() } : {});

  async function listVersions(key: Key): Promise<DocumentVersion[]> {
    const versions: DocumentVersion[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: dataPrefix(key), cursor, limit: 1000, ...blobOptions() });
      for (const blob of page.blobs) {
        const version = parseDataVersion(key, blob.pathname);
        if (version !== null) {
          versions.push({ version, pathname: blob.pathname, url: blob.url, uploadedAt: blob.uploadedAt });
        }
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return versions.toSorted((a, b) => b.version - a.version);
  }

  async function fetchVersion<K extends Key>(key: K, entry: DocumentVersion): Promise<StoredDocument<Doc<K>>> {
    // useCache:false only has an effect on private stores (fresh read from origin);
    // public versions are immutable, so their cached copy is always correct.
    const result = await get(entry.url, { access: config.access, useCache: false, ...blobOptions() });
    if (!result || result.statusCode !== 200) {
      throw new Error(`Cannot read ${entry.pathname}`);
    }
    const json: unknown = await new Response(result.stream).json();
    const document = schemas[key].parse(json) as Doc<K>;
    if (document.version !== entry.version) {
      throw new Error(`${entry.pathname} contains version ${document.version}`);
    }
    return { document, pathname: entry.pathname };
  }

  // Every kept version's document, newest first.
  async function readAll<K extends Key>(key: K): Promise<StoredDocument<Doc<K>>[]> {
    const versions = await listVersions(key);
    return Promise.all(versions.map((entry) => fetchVersion(key, entry)));
  }

  async function read<K extends Key>(key: K): Promise<StoredDocument<Doc<K>> | null> {
    const [latest] = await listVersions(key);
    return latest ? fetchVersion(key, latest) : null;
  }

  async function readVersion<K extends Key>(key: K, version: number): Promise<StoredDocument<Doc<K>> | null> {
    const entry = (await listVersions(key)).find((item) => item.version === version);
    return entry ? fetchVersion(key, entry) : null;
  }

  // Saves only if the latest stored version still equals the version the editor started from.
  async function save<K extends Key>(key: K, expectedVersion: number, content: Content<K>): Promise<SaveResult<Doc<K>>> {
    const versions = await listVersions(key);
    const currentVersion = versions[0]?.version ?? 0;
    if (currentVersion !== expectedVersion) {
      return { ok: false, reason: "conflict", message: VERSION_CONFLICT_MESSAGE };
    }

    const nextVersion = currentVersion + 1;
    const document = schemas[key].parse({
      ...content,
      version: nextVersion,
      updatedAt: new Date().toISOString(),
    }) as Doc<K>;
    const pathname = dataVersionPath(key, nextVersion);

    try {
      await put(pathname, JSON.stringify(document), {
        access: config.access,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: false,
        ...blobOptions(),
      });
    } catch (error) {
      // Losing the race to create this version comes back as a plain BlobError with no
      // dedicated class; confirm with head() instead of matching the server's message text.
      if (await exists(pathname)) {
        return { ok: false, reason: "conflict", message: VERSION_CONFLICT_MESSAGE };
      }
      throw error;
    }

    // The list read before saving plus the new version is the full set (a concurrent save of
    // the same version would have failed above), so no second list call is needed.
    await prune(key, versions, document);
    return { ok: true, document };
  }

  // Rollback: saves the content of an older kept version as a new latest version.
  async function restore<K extends Key>(key: K, fromVersion: number, expectedVersion: number) {
    const source = await readVersion(key, fromVersion);
    if (!source) throw new Error(`Version ${fromVersion} of ${key} is no longer kept`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip metadata; save sets new values
    const { version, updatedAt, ...content } = source.document;
    return save(key, expectedVersion, content as Content<K>);
  }

  // Deletes versions beyond historyLimit, counting the version just created.
  // Best effort: a failed delete only leaves an extra old version behind (and then nothing
  // referenced by it is cleaned up either).
  async function prune(key: Key, previousVersions: DocumentVersion[], saved: Doc<Key>): Promise<void> {
    const stale = previousVersions.slice(config.historyLimit - 1);
    if (stale.length === 0) return;
    const keptEntries = previousVersions.slice(0, config.historyLimit - 1);

    // Read before deleting: the hook needs what the removed versions referenced.
    const removedDocs = config.onVersionsPruned
      ? await Promise.all(stale.map((entry) => fetchVersion(key, entry).then((stored) => stored.document)))
      : [];
    try {
      await del(
        stale.map((entry) => entry.url),
        blobOptions(),
      );
    } catch (error) {
      console.error(`[blob] failed to prune old versions of ${key}`, error);
      return;
    }
    if (!config.onVersionsPruned) return;

    try {
      const keptDocs = await Promise.all(keptEntries.map((entry) => fetchVersion(key, entry).then((stored) => stored.document)));
      await config.onVersionsPruned(key, removedDocs, [saved, ...keptDocs]);
    } catch (error) {
      console.error(`[blob] post-prune cleanup failed for ${key}; left for images:cleanup`, error);
    }
  }

  async function exists(pathname: string): Promise<boolean> {
    try {
      await head(pathname, blobOptions());
      return true;
    } catch (error) {
      if (error instanceof BlobNotFoundError) return false;
      throw error;
    }
  }

  return { listVersions, read, readAll, readVersion, save, restore };
}

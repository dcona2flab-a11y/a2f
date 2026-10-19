// Vercel Blob layout. Live data lives only in Blob, never in the repository.
//
// Each JSON document is stored as immutable versions: data/<key>/v000001.json, v000002.json, ...
// A public store's CDN keeps serving the old content of an overwritten URL (for up to the
// 30-day cache lifetime), so a document is never overwritten — every save creates a new file.

export const DATA_KEYS = ["home", "awards", "projects", "professor", "members", "settings"] as const;

export type DataKey = (typeof DATA_KEYS)[number];

// Path helpers take any document key: public content keys (DataKey) and the private
// "admin-auth" key (stored in a separate private store, see lib/auth/account-store).
export const dataPrefix = (key: string) => `data/${key}/`;

export const dataVersionPath = (key: string, version: number) =>
  `${dataPrefix(key)}v${String(version).padStart(6, "0")}.json`;

// Parses the version from a path made by dataVersionPath; null for anything else.
export function parseDataVersion(key: string, pathname: string): number | null {
  const match = pathname.slice(dataPrefix(key).length).match(/^v(\d{6,})\.json$/);
  return pathname.startsWith(dataPrefix(key)) && match ? Number(match[1]) : null;
}

// Versions kept per document; older ones are deleted after each save. Also the rollback window.
export const DATA_HISTORY_LIMIT = 10;

export const IMAGE_KINDS = ["home", "awards", "projects", "professor", "members"] as const;

export type ImageKind = (typeof IMAGE_KINDS)[number];

export const IMAGE_UPLOAD = {
  allowedTypes: {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/avif": ["avif"],
  },
  // Per file. Admin form and server validation both read this value.
  maxSizeBytes: 10 * 1024 * 1024,
} as const satisfies {
  allowedTypes: Record<string, readonly string[]>;
  maxSizeBytes: number;
};

export type AllowedImageType = keyof typeof IMAGE_UPLOAD.allowedTypes;

// Which image folder belongs to which content document. A document may only reference images
// under its own kind, so an image never has to be checked against another document's history
// before deletion. Settings has no images.
export const DATA_IMAGE_KIND: Partial<Record<DataKey, ImageKind>> = {
  home: "home",
  awards: "awards",
  projects: "projects",
  professor: "professor",
  members: "members",
};

// Uploaded images that no kept content version references (e.g. the content save never
// happened or lost a version conflict) are deleted by `npm run images:cleanup` only after
// this age, so an upload that is still being edited is never removed.
export const ORPHAN_IMAGE_MIN_AGE_HOURS = 24;

// Public pages read data through the Next data cache under these tags.
export const cacheTagFor = (key: DataKey) => `data:${key}`;

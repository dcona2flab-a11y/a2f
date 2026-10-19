// Minimal Vercel Blob check for the storage strategy used by src/lib/blob/json-store.ts:
// immutable versioned files (data/<key>/v000001.json, ...) found via list(), never overwritten.
// Uses a throwaway prefix (never a real data key) and deletes everything it created.
//
// Usage: npm run blob:test   (loads .env.local; Node >= 22.9)

import { del, get, list, put } from "@vercel/blob";

const PREFIX = "data/_connection-test/";
const ACCESS = "public";
const pathFor = (version) => `${PREFIX}v${String(version).padStart(6, "0")}.json`;

const authMode =
  process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID
    ? "OIDC (VERCEL_OIDC_TOKEN + BLOB_STORE_ID)"
    : process.env.BLOB_READ_WRITE_TOKEN
      ? "read-write token (BLOB_READ_WRITE_TOKEN)"
      : "none";

const results = [];
const step = async (name, fn) => {
  try {
    const detail = await fn();
    results.push({ step: name, ok: true, detail });
  } catch (error) {
    results.push({ step: name, ok: false, detail: `${error?.constructor?.name}: ${error?.message}` });
    throw error;
  }
};

const create = (version) =>
  put(pathFor(version), JSON.stringify({ version }), {
    access: ACCESS,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
  });

async function readLatest() {
  const { blobs } = await list({ prefix: PREFIX });
  const latest = blobs.toSorted((a, b) => b.pathname.localeCompare(a.pathname))[0];
  if (!latest) return null;
  const result = await get(latest.url, { access: ACCESS });
  return JSON.parse(await new Response(result.stream).text());
}

async function cleanup() {
  const { blobs } = await list({ prefix: PREFIX });
  if (blobs.length > 0) await del(blobs.map((blob) => blob.url));
}

console.log(`Auth mode: ${authMode}`);

try {
  await step("cleanup leftovers", async () => {
    await cleanup();
    return "ok";
  });

  await step("create v1", async () => (await create(1)).pathname);

  await step("latest = v1 (list + read)", async () => {
    const latest = await readLatest();
    if (latest?.version !== 1) throw new Error(`got ${JSON.stringify(latest)}`);
    return "version=1";
  });

  await step("create v2, latest = v2 immediately", async () => {
    await create(2);
    const latest = await readLatest();
    if (latest?.version !== 2) throw new Error(`stale read: ${JSON.stringify(latest)}`);
    return "version=2";
  });

  await step("second create of v2 is rejected", async () => {
    try {
      await create(2);
    } catch (error) {
      return `rejected (${error?.constructor?.name})`;
    }
    throw new Error("create-only write overwrote an existing version");
  });
} catch {
  // Failure already recorded; fall through to cleanup and report.
} finally {
  await cleanup().catch(() => {});
}

console.table(results);
process.exit(results.every((r) => r.ok) ? 0 : 1);

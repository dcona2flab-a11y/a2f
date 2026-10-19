// Copies a whole Vercel Blob store (data JSON + images) to another store.
// Runs in two steps so only one account's credentials are loaded at a time:
//
//   1. export  — with the SOURCE project's env:  downloads every blob + manifest.json
//   2. import  — with the TARGET project's env:  uploads files, rewrites image URLs inside
//                data/**/*.json (every kept version) to the target store's URLs, uploads the
//                JSON, verifies.
//
// Usage (see docs/MIGRATION.md):
//   node --env-file=.env.source scripts/blob-migrate.mjs export ./migration-data
//   node --env-file=.env.target scripts/blob-migrate.mjs import ./migration-data --dry-run
//   node --env-file=.env.target scripts/blob-migrate.mjs import ./migration-data
//
// Flags (import): --dry-run  show what would happen, write nothing
//                 --force    allow importing into a store that already has blobs (overwrites same paths)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";

const ACCESS = "public";
const DATA_PREFIX = "data/";

const [command, dir, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");
const force = flags.includes("--force");

if (!["export", "import"].includes(command) || !dir) {
  console.error("Usage: blob-migrate.mjs <export|import> <dir> [--dry-run] [--force]");
  process.exit(1);
}

const filesDir = path.join(dir, "files");
const manifestPath = path.join(dir, "manifest.json");

async function listAll() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

async function download(pathname) {
  const result = await get(pathname, { access: ACCESS, useCache: false });
  if (!result || result.statusCode !== 200) throw new Error(`cannot read ${pathname}`);
  return {
    body: Buffer.from(await new Response(result.stream).arrayBuffer()),
    contentType: result.blob.contentType,
  };
}

// Replaces every string that exactly equals a source blob URL with the target URL.
// ImageRef objects keep { url, pathname }, so this covers all stored image references.
function rewriteUrls(value, urlMap, counter) {
  if (typeof value === "string") {
    const next = urlMap.get(value);
    if (next) counter.count += 1;
    return next ?? value;
  }
  if (Array.isArray(value)) return value.map((item) => rewriteUrls(item, urlMap, counter));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteUrls(item, urlMap, counter)]),
    );
  }
  return value;
}

async function exportStore() {
  const blobs = await listAll();
  console.log(`Source store: ${process.env.BLOB_STORE_ID ?? "(token auth)"} — ${blobs.length} blobs`);

  const entries = [];
  for (const blob of blobs) {
    const { body, contentType } = await download(blob.pathname);
    const file = path.join(filesDir, blob.pathname);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
    entries.push({ pathname: blob.pathname, url: blob.url, size: body.length, contentType });
    console.log(`  ↓ ${blob.pathname} (${body.length} B)`);
  }

  await mkdir(dir, { recursive: true });
  const manifest = {
    exportedAt: new Date().toISOString(),
    sourceStoreId: process.env.BLOB_STORE_ID ?? null,
    blobs: entries,
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Exported ${entries.length} blobs to ${dir}`);
}

async function importStore() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const targetStoreId = process.env.BLOB_STORE_ID ?? "(token auth)";
  console.log(`Target store: ${targetStoreId}${dryRun ? " — DRY RUN, nothing will be written" : ""}`);

  if (manifest.sourceStoreId && manifest.sourceStoreId === process.env.BLOB_STORE_ID) {
    throw new Error("Target store is the same as the source store. Load the TARGET project's env.");
  }

  const existing = await list({ limit: 1 });
  if (existing.blobs.length > 0 && !force) {
    throw new Error("Target store is not empty. Re-run with --force only if overwriting is intended.");
  }

  const isData = (entry) => entry.pathname.startsWith(DATA_PREFIX) && entry.pathname.endsWith(".json");
  const assets = manifest.blobs.filter((entry) => !isData(entry));
  const documents = manifest.blobs.filter(isData);

  // 1. Assets first, so every URL the JSON will point to already exists.
  const urlMap = new Map();
  for (const entry of assets) {
    const body = await readFile(path.join(filesDir, entry.pathname));
    if (dryRun) {
      urlMap.set(entry.url, `<target>/${entry.pathname}`);
      console.log(`  would upload ${entry.pathname}`);
      continue;
    }
    const result = await put(entry.pathname, body, {
      access: ACCESS,
      contentType: entry.contentType,
      addRandomSuffix: false,
      allowOverwrite: force,
    });
    urlMap.set(entry.url, result.url);
    console.log(`  ↑ ${entry.pathname}`);
  }

  // 2. Data JSON with rewritten image URLs.
  const sourceHosts = new Set(manifest.blobs.map((entry) => new URL(entry.url).host));
  for (const entry of documents) {
    const json = JSON.parse(await readFile(path.join(filesDir, entry.pathname), "utf8"));
    const counter = { count: 0 };
    const rewritten = JSON.stringify(rewriteUrls(json, urlMap, counter), null, 2);

    const leftover = [...sourceHosts].filter((host) => rewritten.includes(host));
    if (leftover.length > 0) {
      throw new Error(`${entry.pathname} still references the source store (${leftover.join(", ")}) — aborting`);
    }

    if (dryRun) {
      console.log(`  would upload ${entry.pathname} (${counter.count} URLs rewritten)`);
      continue;
    }
    await put(entry.pathname, rewritten, {
      access: ACCESS,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: force,
    });
    console.log(`  ↑ ${entry.pathname} (${counter.count} URLs rewritten)`);
  }

  if (dryRun) {
    console.log(`Dry run OK: ${assets.length} assets and ${documents.length} data files would be imported.`);
    return;
  }

  // 3. Verify every pathname now exists in the target store.
  const targetPaths = new Set((await listAll()).map((blob) => blob.pathname));
  const missing = manifest.blobs.filter((entry) => !targetPaths.has(entry.pathname));
  if (missing.length > 0) {
    throw new Error(`Missing after import: ${missing.map((entry) => entry.pathname).join(", ")}`);
  }
  console.log(`Imported and verified ${manifest.blobs.length} blobs.`);
}

try {
  await (command === "export" ? exportStore() : importStore());
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}

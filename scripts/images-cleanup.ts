// Finds (and optionally deletes) orphan images: files under images/ that no kept version of
// any content document references, and that are older than the age threshold.
//
//   npm run images:cleanup                         dry run (lists what would be deleted)
//   npm run images:cleanup -- --delete             delete them
//   npm run images:cleanup -- --min-age-hours=48   change the threshold (default 24)

import { ORPHAN_IMAGE_MIN_AGE_HOURS } from "../src/config/storage";
import { deleteOrphanImages, findOrphanImages } from "../src/lib/blob/image-gc";

async function main() {
  const shouldDelete = process.argv.includes("--delete");
  const ageArg = process.argv.find((arg) => arg.startsWith("--min-age-hours="));
  const minAgeHours = ageArg ? Number(ageArg.split("=")[1]) : ORPHAN_IMAGE_MIN_AGE_HOURS;
  if (!Number.isFinite(minAgeHours) || minAgeHours < 1) throw new Error("--min-age-hours must be at least 1");

  const result = await findOrphanImages(minAgeHours);
  console.log(
    `images scanned: ${result.scanned} | referenced by kept versions: ${result.referenced} | ` +
      `unreferenced but newer than ${minAgeHours}h (kept): ${result.recentUnreferenced}`,
  );
  for (const orphan of result.orphans) {
    console.log(`  orphan ${orphan.pathname} (${orphan.size} B, ${orphan.uploadedAt.toISOString()})`);
  }
  if (result.orphans.length === 0) return console.log("No orphan images.");
  if (!shouldDelete) return console.log(`${result.orphans.length} orphan(s). Dry run — add -- --delete to remove them.`);
  await deleteOrphanImages(result.orphans);
  console.log(`Deleted ${result.orphans.length} orphan image(s).`);
}

main().catch((error: unknown) => {
  console.error(`실패: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

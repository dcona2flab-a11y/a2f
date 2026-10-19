import "server-only";
import { unstable_cache, updateTag } from "next/cache";
import { readAdminAccount } from "./account-store";

// Every admin request checks the session's epoch against the account's current epoch.
// Reading the private store each time would add ~1s, so the epoch (only the epoch — never
// the password hash) is kept in the server-side data cache.
// - /admin/account changes call refreshAccountCache(): effective immediately.
// - A reset from the CLI (npm run admin:bootstrap -- --reset) cannot reach the Next cache,
//   so the cache also expires on its own: such a reset takes effect within REVALIDATE_SECONDS
//   (up to 10 minutes).

const ACCOUNT_TAG = "auth:admin";
const REVALIDATE_SECONDS = 600; // 10 min: each refresh is a Blob list() (billed advanced operation)

export const getSessionEpoch = unstable_cache(
  async (): Promise<string | null> => (await readAdminAccount())?.account.sessionEpoch ?? null,
  ["auth", "session-epoch"],
  { tags: [ACCOUNT_TAG], revalidate: REVALIDATE_SECONDS },
);

// Server Actions only.
export function refreshAccountCache(): void {
  updateTag(ACCOUNT_TAG);
}

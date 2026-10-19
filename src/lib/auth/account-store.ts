import "server-only";
import { randomBytes } from "node:crypto";
import type { z } from "zod";
import { createVersionedStore } from "@/lib/blob/versioned-store";
import { serverEnv } from "@/lib/env";
import { objectDocument } from "@/lib/validation/common";
import { adminAccountSchema } from "@/lib/validation/auth";

// Admin credentials: data/admin-auth/vNNNNNN.json in the PRIVATE Blob store (reads need
// credentials; useCache:false gives fresh reads). Only the latest version is kept, so old
// password hashes do not accumulate. Never part of the public content keys or services.

const ADMIN_AUTH_KEY = "admin-auth";

const accountStore = createVersionedStore(
  { [ADMIN_AUTH_KEY]: objectDocument(adminAccountSchema) },
  { access: "private", storeId: serverEnv.authStoreId, historyLimit: 1 },
);

export type AdminAccount = z.infer<typeof adminAccountSchema>;

// Latest stored account with its version, or null before bootstrap.
export async function readAdminAccount(): Promise<{ account: AdminAccount; version: number } | null> {
  const stored = await accountStore.read(ADMIN_AUTH_KEY);
  return stored ? { account: stored.document.data, version: stored.document.version } : null;
}

export function saveAdminAccount(expectedVersion: number, account: AdminAccount) {
  return accountStore.save(ADMIN_AUTH_KEY, expectedVersion, { data: account });
}

export function createSessionEpoch(): string {
  return randomBytes(12).toString("base64url");
}

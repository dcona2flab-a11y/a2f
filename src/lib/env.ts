// Server-only secrets and ids. Read lazily so a missing value fails the request that needs it,
// not the whole build. Admin username/password are not env vars — they live in the private
// Blob store (lib/auth/account-store).

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const serverEnv = {
  sessionSecret: () => {
    const secret = required("SESSION_SECRET");
    if (secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
    return secret;
  },
  // Private Blob store for admin credentials (env prefix AUTH_BLOB when connecting the store).
  authStoreId: () => required("AUTH_BLOB_STORE_ID"),
};

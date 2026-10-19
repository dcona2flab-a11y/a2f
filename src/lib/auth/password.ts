import "server-only";
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Hash format: scrypt:N:r:p:<salt base64url>:<hash base64url>
// ':' is used instead of '$' because Next's .env loader expands '$' sequences.
// Hashes are created only on the server (/admin/account) or by scripts/admin-bootstrap.ts.

const PREFIX = "scrypt";
const KEY_LENGTH = 64;
const DEFAULT_PARAMS = { N: 16384, r: 8, p: 1 };

function derive(password: string, salt: Buffer, params: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { ...params, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, DEFAULT_PARAMS);
  const { N, r, p } = DEFAULT_PARAMS;
  return [PREFIX, N, r, p, salt.toString("base64url"), key.toString("base64url")].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== PREFIX) return false;

  const [, N, r, p, saltText, hashText] = parts;
  const expected = Buffer.from(hashText, "base64url");
  const actual = await derive(password, Buffer.from(saltText, "base64url"), {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

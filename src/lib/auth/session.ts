import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";
import { getSessionEpoch } from "./account-cache";
import { readAdminAccount } from "./account-store";
import { ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from "./constants";
import { verifyPassword } from "./password";

// Stateless session: base64url(payload).base64url(HMAC-SHA256(payload)).
// The payload carries the account's sessionEpoch; changing the account (new epoch) or
// rotating SESSION_SECRET invalidates every existing session.

const COOKIE_NAME = ADMIN_SESSION_COOKIE;
const SESSION_TTL_SECONDS = 8 * 60 * 60; // no "keep me signed in"

type SessionPayload = { sub: string; exp: number; epoch: string };

export class AdminAccountNotConfiguredError extends Error {
  constructor() {
    super("No admin account yet — run `npm run admin:bootstrap`.");
  }
}

const sign = (data: string) =>
  createHmac("sha256", serverEnv.sessionSecret()).update(data).digest("base64url");

function encodeSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = Buffer.from(sign(data));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    const valid =
      typeof payload.exp === "number" &&
      payload.exp > Date.now() / 1000 &&
      typeof payload.epoch === "string" &&
      typeof payload.sub === "string";
    return valid ? payload : null;
  } catch {
    return null;
  }
}

// Compare fixed-length digests so the comparison time does not reveal the username.
const sameText = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

// Returns the account's username and epoch on success, null on wrong credentials.
// Throws AdminAccountNotConfiguredError before bootstrap.
export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<{ username: string; sessionEpoch: string } | null> {
  const stored = await readAdminAccount();
  if (!stored) throw new AdminAccountNotConfiguredError();
  const { account } = stored;

  const usernameOk = sameText(username, account.username);
  // Always run the password check so a wrong username takes the same time.
  const passwordOk = await verifyPassword(password, account.passwordHash);
  return usernameOk && passwordOk ? { username: account.username, sessionEpoch: account.sessionEpoch } : null;
}

export async function createAdminSession(username: string, sessionEpoch: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession({ sub: username, exp, epoch: sessionEpoch }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? decodeSession(token) : null;
  if (!payload) return null;

  const currentEpoch = await getSessionEpoch();
  return currentEpoch !== null && sameText(payload.epoch, currentEpoch) ? { username: payload.sub } : null;
}

// The real authorization check. Call it at the top of the protected admin layout and of EVERY
// admin Server Action and admin Route Handler — proxy.ts is only a quick first gate, and
// hiding UI on the client is not authorization.
export async function requireAdmin(): Promise<{ username: string }> {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);
  return session;
}

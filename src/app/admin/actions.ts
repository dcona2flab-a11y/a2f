"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH, LOGIN_FAILURE_DELAY_MS, safeAdminRedirect } from "@/lib/auth/constants";
import {
  AdminAccountNotConfiguredError,
  createAdminSession,
  destroyAdminSession,
  verifyAdminCredentials,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";

export type LoginState = { error: string | null };

// Same message whether the ID or the password was wrong.
const LOGIN_FAILED = "아이디 또는 비밀번호가 올바르지 않습니다.";
const LOGIN_UNAVAILABLE = "관리자 로그인이 아직 설정되지 않았습니다. 관리자에게 문의하세요.";

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  let account: Awaited<ReturnType<typeof verifyAdminCredentials>> = null;
  if (parsed.success) {
    try {
      account = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
    } catch (error) {
      // No account yet (bootstrap not run) or missing SESSION_SECRET / AUTH_BLOB_STORE_ID.
      if (!(error instanceof AdminAccountNotConfiguredError)) console.error("[auth] login unavailable", error);
      await sleep(LOGIN_FAILURE_DELAY_MS);
      return { error: LOGIN_UNAVAILABLE };
    }
  }

  if (!parsed.success || !account) {
    await sleep(LOGIN_FAILURE_DELAY_MS);
    return { error: LOGIN_FAILED };
  }

  await createAdminSession(account.username, account.sessionEpoch);
  redirect(safeAdminRedirect(parsed.data.next));
}

export async function logout(): Promise<void> {
  await destroyAdminSession();
  redirect(ADMIN_LOGIN_PATH);
}

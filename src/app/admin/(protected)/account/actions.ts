"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { redirect } from "next/navigation";
import { refreshAccountCache } from "@/lib/auth/account-cache";
import { createSessionEpoch, readAdminAccount, saveAdminAccount } from "@/lib/auth/account-store";
import { ADMIN_LOGIN_PATH, LOGIN_FAILURE_DELAY_MS } from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { destroyAdminSession, requireAdmin } from "@/lib/auth/session";
import { accountChangeSchema } from "@/lib/validation/auth";

export type AccountFieldErrors = Partial<Record<"currentPassword" | "username" | "newPassword" | "confirmPassword", string>>;
export type AccountState = { error: string | null; fieldErrors: AccountFieldErrors };

const ok = (error: string | null, fieldErrors: AccountFieldErrors = {}): AccountState => ({ error, fieldErrors });

// Order: requireAdmin → current password → Zod → new hash → versioned save → invalidate sessions.
export async function changeAccount(_previous: AccountState, formData: FormData): Promise<AccountState> {
  await requireAdmin();

  const stored = await readAdminAccount(); // fresh read, not the cache
  if (!stored) return ok("계정 정보를 찾을 수 없습니다. 개발자에게 문의하세요.");

  // Current password is required for every change, including a username-only change.
  const currentPassword = formData.get("currentPassword");
  const passwordOk =
    typeof currentPassword === "string" &&
    currentPassword.length > 0 &&
    currentPassword.length <= 200 &&
    (await verifyPassword(currentPassword, stored.account.passwordHash));
  if (!passwordOk) {
    await sleep(LOGIN_FAILURE_DELAY_MS);
    return ok(null, { currentPassword: "현재 비밀번호가 올바르지 않습니다." });
  }

  const parsed = accountChangeSchema.safeParse({
    username: formData.get("username"),
    newPassword: formData.get("newPassword") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: AccountFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof AccountFieldErrors;
      fieldErrors[field] ??= issue.message;
    }
    return ok(null, fieldErrors);
  }

  const { username, newPassword } = parsed.data;
  if (username === stored.account.username && newPassword === "") {
    return ok("변경할 내용이 없습니다. 새 아이디 또는 새 비밀번호를 입력하세요.");
  }

  const passwordHash = newPassword ? await hashPassword(newPassword) : stored.account.passwordHash;
  const saved = await saveAdminAccount(stored.version, {
    username,
    passwordHash,
    sessionEpoch: createSessionEpoch(), // invalidates every existing session
  });
  if (!saved.ok) return ok(saved.message);

  refreshAccountCache();
  await destroyAdminSession();
  redirect(`${ADMIN_LOGIN_PATH}?changed=1`);
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { safeAdminRedirect } from "@/lib/auth/constants";
import { getAdminSession } from "@/lib/auth/session";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "로그인" };

type Props = { searchParams: Promise<{ next?: string | string[]; changed?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { next, changed } = await searchParams;
  const nextPath = safeAdminRedirect(Array.isArray(next) ? next[0] : next);

  if (await getAdminSession().catch(() => null)) redirect(nextPath);

  return (
    <main className={styles.page}>
      <LoginForm
        next={nextPath}
        notice={changed === "1" ? "계정 정보가 변경되었습니다. 새 정보로 다시 로그인하세요." : null}
      />
    </main>
  );
}

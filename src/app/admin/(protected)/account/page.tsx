import type { Metadata } from "next";
import AccountForm from "@/components/admin/AccountForm";
import { requireAdmin } from "@/lib/auth/session";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "계정" };

// Admin-only page (no public counterpart), like /admin/login.
export default async function AdminAccountPage() {
  const { username } = await requireAdmin();
  return (
    <main className={styles.page}>
      <AccountForm currentUsername={username} />
    </main>
  );
}

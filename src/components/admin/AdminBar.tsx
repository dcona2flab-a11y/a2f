"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import Button from "@/components/common/Button";
import { toPublicPath } from "@/lib/admin-paths";
import styles from "./AdminBar.module.css";

// Thin strip shown above the real (public) page design in admin routes only.
// Navigation between pages uses the shared public GNB, not this bar.
export default function AdminBar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <div className={styles.bar} role="region" aria-label="관리자 편집 모드">
      <span className={styles.mode}>Edit mode</span>
      <div className={styles.actions}>
        <a className={styles.viewLink} href={toPublicPath(pathname)} target="_blank" rel="noreferrer">
          사이트에서 보기
        </a>
        <Link className={styles.viewLink} href="/admin/account">
          계정
        </Link>
        <span className={styles.user}>{username}</span>
        <form action={logout}>
          <Button type="submit" variant="secondary" size="sm">
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}

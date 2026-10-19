import Link from "next/link";
import Logo from "@/components/common/Logo";
import { SITE } from "@/config/site";
import type { NavBasePath } from "@/config/navigation";
import HeaderNav from "./HeaderNav";
import MobileMenu from "./MobileMenu";
import styles from "./SiteHeader.module.css";

// Shared by public and admin pages. basePath="/admin" only re-points the links.
export default function SiteHeader({ basePath = "" }: { basePath?: NavBasePath }) {
  const publicationUrl = SITE.publicationUrl || null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.home} href={basePath || "/"} aria-label="A2F Design Lab Home">
          <Logo variant="markBlack" className={styles.mark} priority />
          <Logo variant="lockup" className={styles.lockup} priority />
        </Link>
        <HeaderNav className={styles.desktopNav} basePath={basePath} publicationUrl={publicationUrl} />
        <MobileMenu className={styles.mobileMenu} basePath={basePath} publicationUrl={publicationUrl} />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import type { NavBasePath } from "@/config/navigation";
import styles from "./HeaderNav.module.css";
import { useNavLinks } from "./useNavLinks";

type Props = { basePath: NavBasePath; publicationUrl: string | null; className?: string };

// Desktop GNB (1440/1920): PUBLICATION / PROJECT / TEAM.
export default function HeaderNav({ basePath, publicationUrl, className }: Props) {
  const links = useNavLinks(basePath, publicationUrl).filter((link) => !link.mobileOnly);

  return (
    <nav className={className} aria-label="주 메뉴">
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.key}>
            {link.href === null ? (
              <span className={`${styles.link} ${styles.disabled}`} aria-disabled="true">
                {link.label}
              </span>
            ) : link.external ? (
              <a className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ) : (
              <Link
                className={`${styles.link} ${link.active ? styles.active : ""}`}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

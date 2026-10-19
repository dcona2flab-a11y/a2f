"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import close365 from "@/assets/icons/close-365.svg";
import close768 from "@/assets/icons/close-768.svg";
import type { NavBasePath } from "@/config/navigation";
import styles from "./MobileMenu.module.css";
import { useNavLinks } from "./useNavLinks";

type Props = { basePath: NavBasePath; publicationUrl: string | null; className?: string };

// Hamburger + right-side panel for 365/768 (Figma "Home_Hambuger" frames).
// The panel stays mounted so CSS can animate both opening and closing; when closed it is
// `inert` and hidden from assistive tech.
export default function MobileMenu({ basePath, publicationUrl, className }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const links = useNavLinks(basePath, publicationUrl);

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    document.documentElement.classList.add(styles.scrollLocked);
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // Keep Tab focus inside the panel while it is open.
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove(styles.scrollLocked);
      toggle?.focus();
    };
  }, [open]);

  return (
    <div className={className}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-label="메뉴 열기"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <span className={styles.toggleLines} aria-hidden="true" />
      </button>

      <div className={`${styles.overlay} ${open ? styles.open : ""}`} inert={!open} aria-hidden={!open}>
        <div className={styles.backdrop} onClick={() => setOpen(false)} />
        <div ref={panelRef} id={panelId} className={styles.panel} role="dialog" aria-modal="true" aria-label="메뉴">
          <button type="button" className={styles.close} aria-label="메뉴 닫기" onClick={() => setOpen(false)}>
            <Image className={styles.closeIcon365} src={close365} alt="" unoptimized />
            <Image className={styles.closeIcon768} src={close768} alt="" unoptimized />
          </button>
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
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

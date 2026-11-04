"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavBasePath } from "@/config/navigation";
import styles from "./MobileMenu.module.css";
import { useNavLinks } from "./useNavLinks";

type Props = { basePath: NavBasePath; publicationUrl: string | null; className?: string };

// Hamburger + right-side panel for 365/768 (Figma "Home_Hambuger" frames).
// The panel stays mounted so CSS can animate both opening and closing; when closed it is
// `inert` and hidden from assistive tech. The close button sits outside the sliding panel, where
// the hamburger is, and is drawn as two lines that cross into the X (designer feedback 2026-11-04).
export default function MobileMenu({ basePath, publicationUrl, className }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
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
    const dialog = dialogRef.current;
    const toggle = toggleRef.current;
    const root = document.documentElement;
    // Locking the scroll removes a classic scrollbar; its width is kept as padding (CSS) so the
    // page behind the panel does not shift sideways.
    root.style.setProperty("--scrollbar-gap", `${window.innerWidth - root.clientWidth}px`);
    root.classList.add(styles.scrollLocked);
    dialog?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // Keep Tab focus inside the menu while it is open.
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
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
      root.classList.remove(styles.scrollLocked);
      root.style.removeProperty("--scrollbar-gap");
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

      <div
        ref={dialogRef}
        id={panelId}
        className={`${styles.overlay} ${open ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        inert={!open}
        aria-hidden={!open}
      >
        <div className={styles.backdrop} onClick={() => setOpen(false)} />
        <button type="button" className={styles.close} aria-label="메뉴 닫기" onClick={() => setOpen(false)}>
          <span className={styles.closeLine} aria-hidden="true" />
          <span className={styles.closeLine} aria-hidden="true" />
        </button>
        <div className={styles.panel}>
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

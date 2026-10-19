import type { ReactNode } from "react";
import ScrollToTop from "@/components/public/ui/ScrollToTop";
import styles from "./ProjectPage.module.css";

// Project list page frame: side padding, top/bottom spacing and the 1920 scroll-to-top.
export default function ProjectPage({ children }: { children: ReactNode }) {
  return (
    <main className={styles.main}>
      {children}
      <ScrollToTop className={styles.scrollToTop} />
    </main>
  );
}

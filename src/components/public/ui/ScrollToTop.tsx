"use client";

import Image from "next/image";
import arrow from "@/assets/project/scroll-to-top.svg";
import styles from "./ScrollToTop.module.css";

// Figma "1920 Scroll to top" (0:2122): green arrow box + vertical "Scroll to top". Shown from
// 1920 up (Figma has it only there); `className` places it on a page. Smooth scroll unless the
// visitor prefers reduced motion.
export default function ScrollToTop({ className }: { className?: string }) {
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      <button type="button" className={styles.button} onClick={toTop}>
        <Image className={styles.arrow} src={arrow} alt="" unoptimized />
        <span className={styles.label}>Scroll to top</span>
      </button>
    </div>
  );
}

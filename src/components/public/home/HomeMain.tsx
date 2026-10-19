import type { ReactNode } from "react";
import styles from "./HomeMain.module.css";

// Home page frame: side padding and the vertical rhythm between sections (Figma auto layout).
export default function HomeMain({ children }: { children: ReactNode }) {
  return <main className={styles.main}>{children}</main>;
}

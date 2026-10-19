import type { ReactNode } from "react";
import styles from "./TeamPage.module.css";

type Props = {
  top: ReactNode;      // intro + professor (one tighter block in Figma)
  children: ReactNode; // Student, Alumni
};

// Team page frame: side padding, top/bottom spacing and the gaps between the blocks.
export default function TeamPage({ top, children }: Props) {
  return (
    <main className={styles.main}>
      <div className={styles.top}>{top}</div>
      {children}
    </main>
  );
}

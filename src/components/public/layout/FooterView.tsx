import Logo from "@/components/common/Logo";
import styles from "./FooterView.module.css";

// Presentation only (shared by the public footer and the admin's editable footer).
// `lines` are phrases of one sentence; CSS decides where they break per breakpoint.
export default function FooterView({ lines }: { lines: string[] }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Logo variant="mark" className={styles.mark} />
        <p className={styles.text}>
          {lines.map((line, index) => (
            <span key={index} className={styles.line}>
              {line}
              {/* real space between phrases (copy/paste, screen readers); collapses at block breaks */}
              {index < lines.length - 1 && " "}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}

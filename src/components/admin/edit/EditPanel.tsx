"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./EditPanel.module.css";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;  // Esc, the close button; the parent decides (e.g. not while saving)
  children: ReactNode;  // the form
};

// Right-side drawer for input that does not fit in place (Award, Project, Professor sections).
// Native modal <dialog>: focus trap, Esc and inert page come from the browser.
export default function EditPanel({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.panel}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
          ×
        </button>
      </div>
      <div className={styles.body}>{open && children}</div>
    </dialog>
  );
}

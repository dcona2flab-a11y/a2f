"use client";

import { useEffect, useId, useRef } from "react";
import Button from "@/components/common/Button";
import styles from "./ConfirmDialog.module.css";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Confirmation before destructive actions. Native <dialog> (modal): focus trap, Esc and
// inert background come from the browser.
export default function ConfirmDialog({ open, title, message, confirmLabel = "삭제", onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.dialog} onCancel={onCancel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} autoFocus>
          취소
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

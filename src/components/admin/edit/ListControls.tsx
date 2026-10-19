"use client";

import styles from "./ListControls.module.css";

type Props = {
  itemLabel: string; // e.g. the item title, for screen readers ("<title> 수정")
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  disabled?: boolean;
};

// Per-item admin controls over a list item (수정 / 삭제 / 위·아래). Only the given ones show.
export default function ListControls({ itemLabel, onEdit, onDelete, onMoveUp, onMoveDown, disabled = false }: Props) {
  return (
    <div className={styles.controls}>
      {onMoveUp && (
        <button type="button" className={styles.button} disabled={disabled} onClick={onMoveUp} aria-label={`${itemLabel} 위로`}>
          ↑
        </button>
      )}
      {onMoveDown && (
        <button type="button" className={styles.button} disabled={disabled} onClick={onMoveDown} aria-label={`${itemLabel} 아래로`}>
          ↓
        </button>
      )}
      {onEdit && (
        <button type="button" className={styles.button} disabled={disabled} onClick={onEdit} aria-label={`${itemLabel} 수정`}>
          수정
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className={`${styles.button} ${styles.danger}`}
          disabled={disabled}
          onClick={onDelete}
          aria-label={`${itemLabel} 삭제`}
        >
          삭제
        </button>
      )}
    </div>
  );
}

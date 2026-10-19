"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/components/common/Button";
import { useEditable } from "./Editable";
import type { SaveOutcome } from "./InlineTextEditor";
import styles from "./SaveActions.module.css";

// 저장 / 취소 for editors with their own state (image lists, people): saves, then closes the
// Editable and refreshes the page; a failed save shows its message in place.
export function useSaveAndClose(save: () => Promise<SaveOutcome>) {
  const { close } = useEditable();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const submit = () =>
    startTransition(async () => {
      setError(null);
      const outcome = await save();
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      // Close together with the refreshed page (new data and version), so an editor opened
      // right after this save never starts from the old version (false conflict).
      startTransition(() => {
        router.refresh();
        close();
      });
    });
  return { close, error, pending, submit };
}

type Props = { pending: boolean; error: string | null; onSave: () => void; onCancel: () => void };

export default function SaveActions({ pending, error, onSave, onCancel }: Props) {
  return (
    <>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button size="sm" onClick={onSave} disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={pending}>
          취소
        </Button>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/components/common/Button";
import { Field, TextArea, TextInput } from "@/components/common/form/Field";
import { useEditable } from "./Editable";
import styles from "./InlineTextEditor.module.css";

export type SaveOutcome = { ok: true } | { ok: false; message: string };

type Props = {
  label: string;
  initialValue: string;
  hint?: string;
  multiline?: boolean;
  compact?: boolean; // narrow regions inside the page grid (no page side padding)
  onSave: (value: string) => Promise<SaveOutcome>;
};

// Simple text editing in place: input/textarea + 저장 / 취소. On success the editor closes
// and the page re-renders with the saved content.
export default function InlineTextEditor({ label, initialValue, hint, multiline = false, compact = false, onSave }: Props) {
  const { close } = useEditable();
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      setError(null);
      const outcome = await onSave(value);
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

  return (
    <form
      className={`${styles.editor} ${compact ? styles.compact : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <Field label={label} hint={hint} error={error}>
        {multiline ? (
          <TextArea value={value} onChange={(event) => setValue(event.target.value)} autoFocus />
        ) : (
          <TextInput value={value} onChange={(event) => setValue(event.target.value)} autoFocus />
        )}
      </Field>
      <div className={styles.actions}>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={close} disabled={pending}>
          취소
        </Button>
      </div>
    </form>
  );
}

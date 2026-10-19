"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/components/common/Button";
import { Field, Select, TextArea, TextInput } from "@/components/common/form/Field";
import { useEditable } from "./Editable";
import type { SaveOutcome } from "./InlineTextEditor";
import styles from "./InlineTextEditor.module.css";

export type FieldSpec<N extends string> = {
  name: N;
  label: string;
  hint?: string;
  multiline?: boolean;
  type?: "text" | "email" | "tel" | "date" | "select";
  options?: { value: string; label: string }[]; // type "select"
};

type Props<N extends string> = {
  fields: FieldSpec<N>[];
  initialValues: Record<N, string>;
  compact?: boolean;
  onSave: (values: Record<N, string>) => Promise<SaveOutcome>;
};

// Several related texts edited and saved together (e.g. a research field's title, subtitle
// and description), in place like InlineTextEditor.
export default function InlineFieldsEditor<N extends string>({ fields, initialValues, compact = false, onSave }: Props<N>) {
  const { close } = useEditable();
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      setError(null);
      const outcome = await onSave(values);
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
      {fields.map((field, index) => {
        const control = {
          value: values[field.name],
          onChange: (event: { target: { value: string } }) =>
            setValues((current) => ({ ...current, [field.name]: event.target.value })),
          autoFocus: index === 0,
        };
        return (
          <Field key={field.name} label={field.label} hint={field.hint}>
            {field.multiline ? (
              <TextArea {...control} />
            ) : field.type === "select" ? (
              <Select {...control}>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : (
              <TextInput type={field.type ?? "text"} {...control} />
            )}
          </Field>
        );
      })}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
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

"use client";

import { useRef, useState } from "react";
import Button from "@/components/common/Button";
import { TextInput } from "@/components/common/form/Field";
import type { SaveOutcome } from "./InlineTextEditor";
import SaveActions, { useSaveAndClose } from "./SaveActions";
import styles from "./StringListEditor.module.css";

type Props = {
  label: string; // e.g. "Education", for the legend and the per-row screen reader labels
  items: string[];
  onSave: (items: string[]) => Promise<SaveOutcome>;
};

type Row = { key: number; value: string };

// Plain text lines (string[]): edit in place, add, delete, ↑/↓. Nothing is stored until 저장;
// blank rows are dropped on save. No rich text.
export default function StringListEditor({ label, items, onSave }: Props) {
  const nextKey = useRef(items.length);
  const listRef = useRef<HTMLOListElement>(null);
  const [rows, setRows] = useState<Row[]>(() => items.map((value, key) => ({ key, value })));
  const { close, error, pending, submit } = useSaveAndClose(() =>
    onSave(rows.map((row) => row.value.trim()).filter(Boolean)),
  );

  const update = (key: number, value: string) => setRows((current) => current.map((row) => (row.key === key ? { ...row, value } : row)));
  const remove = (key: number) => setRows((current) => current.filter((row) => row.key !== key));
  const move = (index: number, to: number) =>
    setRows((current) => {
      const next = [...current];
      const [row] = next.splice(index, 1);
      next.splice(to, 0, row);
      return next;
    });
  const add = () => {
    setRows((current) => [...current, { key: nextKey.current++, value: "" }]);
    // Focus the new row once it is rendered.
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLInputElement>("li:last-child input")?.focus());
  };

  return (
    <div className={styles.editor}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {label} ({rows.length}개)
        </legend>
        {rows.length === 0 && <p className={styles.empty}>항목이 없습니다. 비워 두면 공개 페이지에서 이 섹션이 표시되지 않습니다.</p>}
        <ol ref={listRef} className={styles.rows}>
          {rows.map((row, index) => (
            <li key={row.key} className={styles.row}>
              <TextInput
                className={styles.input}
                value={row.value}
                onChange={(event) => update(row.key, event.target.value)}
                aria-label={`${label} ${index + 1}번째 항목`}
              />
              <div className={styles.controls}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`${index + 1}번째 항목 위로`}
                >
                  ↑
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => move(index, index + 1)}
                  disabled={index === rows.length - 1}
                  aria-label={`${index + 1}번째 항목 아래로`}
                >
                  ↓
                </Button>
                <Button variant="danger" size="sm" onClick={() => remove(row.key)} aria-label={`${index + 1}번째 항목 삭제`}>
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <div>
          <Button variant="secondary" size="sm" onClick={add}>
            항목 추가
          </Button>
        </div>
      </fieldset>
      <SaveActions pending={pending} error={error} onSave={submit} onCancel={close} />
    </div>
  );
}

"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Button from "@/components/common/Button";
import { IMAGE_UPLOAD, type ImageKind } from "@/config/storage";
import type { ImageRef } from "@/types/content";
import type { SaveOutcome } from "./InlineTextEditor";
import styles from "./ImageReplace.module.css";
import { useImageUpload } from "./useImageUpload";

type Props = {
  kind: ImageKind;
  entityId: string;
  alt?: string;
  // Called with the new image when the admin presses 저장; it saves and returns the outcome.
  onReplace: (image: ImageRef) => void | Promise<SaveOutcome>;
  fill?: boolean;      // the image fills a positioned slot (e.g. a Home collage photo)
  children: ReactNode; // the image as rendered by the shared public component
};

const ACCEPT = Object.keys(IMAGE_UPLOAD.allowedTypes).join(",");

// "이미지 변경" over an image. The chosen file is uploaded and shown in place as a preview;
// nothing changes on the site until 저장. 취소 (or Esc) drops the preview: that upload is
// then referenced by no content and is removed by `npm run images:cleanup` after 24 h.
// A replaced old file is not touched here (it is deleted later, once no kept version uses it).
export default function ImageReplace({ kind, entityId, alt = "", onReplace, fill = false, children }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const { upload, uploading, progress } = useImageUpload(kind, entityId);
  const [pending, setPending] = useState<ImageRef | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = uploading || saving;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const outcome = await upload(file, alt);
    if (inputRef.current) inputRef.current.value = "";
    if (!outcome.ok) {
      setError(outcome.message);
      return;
    }
    setPending(outcome.image);
    requestAnimationFrame(() => saveRef.current?.focus());
  };

  // The file input is re-enabled on the next render, so focus it after that.
  const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());

  const cancel = () => {
    setPending(null);
    setError(null);
    focusInput();
  };

  const save = async () => {
    if (!pending) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await onReplace(pending);
      if (saved && !saved.ok) {
        setError(saved.message);
        return;
      }
      setPending(null);
      focusInput();
    } finally {
      setSaving(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && pending && !saving) cancel();
  };

  return (
    <div className={`${styles.region} ${fill ? styles.fill : ""}`} onKeyDown={onKeyDown}>
      {children}
      {pending && (
        <div className={styles.preview}>
          <Image className={styles.previewImage} src={pending.url} alt="" fill sizes="50vw" />
          <span className={styles.badge}>미리보기 · 저장 전</span>
        </div>
      )}
      {pending ? (
        <div className={styles.actions}>
          <Button ref={saveRef} size="sm" onClick={save} disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </Button>
          <Button size="sm" variant="secondary" onClick={cancel} disabled={saving}>
            취소
          </Button>
        </div>
      ) : (
        <label className={`${styles.button} ${busy ? styles.busy : ""}`} htmlFor={inputId}>
          {uploading ? `업로드 중 ${progress}%` : "이미지 변경"}
        </label>
      )}
      <input
        ref={inputRef}
        id={inputId}
        className={styles.input}
        type="file"
        accept={ACCEPT}
        disabled={busy || pending !== null}
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

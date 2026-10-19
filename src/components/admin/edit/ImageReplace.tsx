"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { IMAGE_UPLOAD, type ImageKind } from "@/config/storage";
import type { ImageRef } from "@/types/content";
import type { SaveOutcome } from "./InlineTextEditor";
import styles from "./ImageReplace.module.css";
import { useImageUpload } from "./useImageUpload";

type Props = {
  kind: ImageKind;
  entityId: string;
  alt?: string;
  // The parent decides when the content is saved; it may save right away and return the outcome.
  onReplace: (image: ImageRef) => void | Promise<SaveOutcome>;
  fill?: boolean;      // the image fills a positioned slot (e.g. a Home collage photo)
  children: ReactNode; // the image as rendered by the shared public component
};

const ACCEPT = Object.keys(IMAGE_UPLOAD.allowedTypes).join(",");

// "이미지 변경" over an image. Uploads a new file and hands it to the editor; the old file is
// not touched here (it is deleted later, only once no kept content version references it).
export default function ImageReplace({ kind, entityId, alt = "", onReplace, fill = false, children }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress } = useImageUpload(kind, entityId);
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
    setSaving(true);
    try {
      const saved = await onReplace(outcome.image);
      if (saved && !saved.ok) setError(saved.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${styles.region} ${fill ? styles.fill : ""}`}>
      {children}
      <label className={`${styles.button} ${busy ? styles.busy : ""}`} htmlFor={inputId}>
        {uploading ? `업로드 중 ${progress}%` : saving ? "저장 중…" : "이미지 변경"}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className={styles.input}
        type="file"
        accept={ACCEPT}
        disabled={busy}
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

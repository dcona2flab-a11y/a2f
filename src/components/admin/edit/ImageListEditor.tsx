"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { IMAGE_UPLOAD, type ImageKind } from "@/config/storage";
import type { ImageRef } from "@/types/content";
import ConfirmDialog from "./ConfirmDialog";
import styles from "./ImageListEditor.module.css";
import { useImageUpload } from "./useImageUpload";

type Props = {
  kind: ImageKind;
  entityId: string;
  images: ImageRef[];
  onChange: (images: ImageRef[]) => void;  // the parent editor saves the content
  max?: number;                             // e.g. professor images ≤ 3
  label?: string;
};

const ACCEPT = Object.keys(IMAGE_UPLOAD.allowedTypes).join(",");

const move = <T,>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

// Ordered image list: add (upload), remove (with confirmation), reorder with ↑/↓ buttons or
// native drag & drop. Removing only drops the reference; the file is deleted later, once no
// kept content version references it. The first image is the representative one.
export default function ImageListEditor({ kind, entityId, images, onChange, max, label = "이미지" }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress } = useImageUpload(kind, entityId);
  const [errors, setErrors] = useState<string[]>([]);
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const full = max !== undefined && images.length >= max;

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    setErrors([]);
    let next = images;
    const failures: string[] = [];
    for (const file of [...files]) {
      if (max !== undefined && next.length >= max) {
        failures.push(`${file.name}: 최대 ${max}장까지 등록할 수 있습니다.`);
        continue;
      }
      const outcome = await upload(file);
      if (outcome.ok) {
        next = [...next, outcome.image];
        onChange(next);
      } else {
        failures.push(`${file.name}: ${outcome.message}`);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
    setErrors(failures);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <span className={styles.label}>
          {label} {max !== undefined && `(${images.length}/${max})`}
        </span>
        <label className={`${styles.add} ${full || uploading ? styles.addDisabled : ""}`} htmlFor={inputId}>
          {uploading ? `업로드 중 ${progress}%` : "이미지 추가"}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className={styles.input}
          type="file"
          accept={ACCEPT}
          multiple
          disabled={full || uploading}
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <p className={styles.empty}>등록된 이미지가 없습니다.</p>
      ) : (
        <ol className={styles.list}>
          {images.map((image, index) => (
            <li
              key={image.pathname}
              className={`${styles.item} ${dragIndex === index ? styles.dragging : ""}`}
              draggable
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                // The dragged index travels with the drag itself (state may not have re-rendered yet).
                const from = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isInteger(from) && from !== index && images[from]) onChange(move(images, from, index));
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
            >
              <Image
                className={styles.thumb}
                src={image.url}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="160px"
              />
              <span className={styles.order}>{index === 0 ? "대표" : index + 1}</span>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.icon}
                  onClick={() => onChange(move(images, index, index - 1))}
                  disabled={index === 0}
                  aria-label={`${index + 1}번 이미지를 앞으로`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.icon}
                  onClick={() => onChange(move(images, index, index + 1))}
                  disabled={index === images.length - 1}
                  aria-label={`${index + 1}번 이미지를 뒤로`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={`${styles.icon} ${styles.remove}`}
                  onClick={() => setPendingRemove(index)}
                  aria-label={`${index + 1}번 이미지 삭제`}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title="이미지를 삭제할까요?"
        message="저장하면 사이트에서 빠집니다."
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (pendingRemove !== null) onChange(images.filter((_, index) => index !== pendingRemove));
          setPendingRemove(null);
        }}
      />
    </div>
  );
}

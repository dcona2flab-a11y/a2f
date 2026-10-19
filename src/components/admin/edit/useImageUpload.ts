"use client";

import { uploadPresigned } from "@vercel/blob/client";
import { useCallback, useState } from "react";
import { finalizeImageUpload, prepareImageUpload } from "@/app/admin/(protected)/image-actions";
import type { ImageKind } from "@/config/storage";
import type { ImageRef } from "@/types/content";

export type UploadOutcome = { ok: true; image: ImageRef } | { ok: false; message: string };

// Reads the pixel size in the browser. Sent to the server as metadata only (range-checked
// there, never trusted for security).
async function measure(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

// prepare (server validates + generates the path) → direct upload to Blob → finalize
// (server verifies size, type and image signature). The result is a temporary image until a
// content save references it.
export function useImageUpload(kind: ImageKind, entityId: string) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File, alt = ""): Promise<UploadOutcome> => {
      setUploading(true);
      setProgress(0);
      try {
        const size = await measure(file);
        if (!size) return { ok: false, message: "이미지 파일을 읽을 수 없습니다." };

        const prepared = await prepareImageUpload({
          kind,
          entityId,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        });
        if (!prepared.ok) return prepared;

        await uploadPresigned(prepared.pathname, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
          contentType: prepared.contentType,
          onUploadProgress: ({ percentage }) => setProgress(percentage),
        });

        return await finalizeImageUpload({ pathname: prepared.pathname, ...size, alt });
      } catch (error) {
        console.error("[upload]", error);
        return { ok: false, message: "업로드하지 못했습니다. 다시 시도해 주세요." };
      } finally {
        setUploading(false);
      }
    },
    [kind, entityId],
  );

  return { upload, uploading, progress };
}

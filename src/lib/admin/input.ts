import "server-only";
import { z } from "zod";
import type { ImageKind } from "@/config/storage";
import { parseImagePathname } from "@/lib/blob/images";
import { imageRefSchema } from "@/lib/validation/common";

// Zod builders for admin form input, with messages shown to the admin (Korean).
// Stored documents are validated again by the content schemas when saved.

export function text(label: string, max: number, { required = false } = {}) {
  const base = z.string(`${label}: 텍스트를 입력하세요.`).trim().max(max, `${label}: ${max}자 이하로 입력하세요.`);
  return required ? base.min(1, `${label}: 필수 항목입니다.`) : base;
}

// An uploaded image of the given kind: the path must be one our upload flow generated, and
// the URL must be that path on a Vercel Blob public store.
export function uploadedImage(kind: ImageKind) {
  return imageRefSchema.extend({ alt: z.string().trim().max(300) }).refine((image) => {
    if (parseImagePathname(image.pathname)?.kind !== kind) return false;
    const url = new URL(image.url);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") && url.pathname === `/${image.pathname}`;
  }, "이미지 정보가 올바르지 않습니다. 다시 업로드해 주세요.");
}

// First problem as one admin-readable message.
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "입력 내용을 확인해 주세요.";
}

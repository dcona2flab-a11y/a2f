"use server";

import { head } from "@vercel/blob";
import { z } from "zod";
import { IMAGE_KINDS, IMAGE_UPLOAD } from "@/config/storage";
import { requireAdmin } from "@/lib/auth/session";
import { createImagePathname, deleteImages, detectImageType, parseImagePathname } from "@/lib/blob/images";
import { idSchema } from "@/lib/validation/common";
import { checkImageFile } from "@/lib/validation/upload";
import type { ImageRef } from "@/types/content";

// Image upload, steps 1 and 3 (step 2 is the browser's direct upload via /api/admin/upload).
// An uploaded file is only "temporary" until a content save references it; unreferenced files
// are removed later by `npm run images:cleanup`.

export type PrepareResult = { ok: true; pathname: string; contentType: string } | { ok: false; message: string };
export type FinalizeResult = { ok: true; image: ImageRef } | { ok: false; message: string };

const prepareSchema = z.object({
  kind: z.enum(IMAGE_KINDS),
  entityId: idSchema,
  fileName: z.string().min(1).max(255),
  contentType: z.string().max(100),
  size: z.number().int().nonnegative(),
});

// 1. Validate what the browser declares and generate the storage path on the server.
export async function prepareImageUpload(input: z.input<typeof prepareSchema>): Promise<PrepareResult> {
  await requireAdmin();
  const parsed = prepareSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "업로드 요청이 올바르지 않습니다." };

  const { kind, entityId, fileName, contentType, size } = parsed.data;
  const checked = checkImageFile({ name: fileName, type: contentType, size });
  if (!checked.ok) return { ok: false, message: checked.error };

  // The original file name is used only for the extension check above, never in the path.
  return { ok: true, pathname: createImagePathname(kind, entityId, checked.extension), contentType: checked.contentType };
}

// Width/height come from the browser: metadata only, range-checked, never used for security.
const finalizeSchema = z.object({
  pathname: z.string().max(300),
  width: z.number().int().min(1).max(20000),
  height: z.number().int().min(1).max(20000),
  alt: z.string().trim().max(300),
});

const SIGNATURE_BYTES = 64;

// 3. Verify the stored file itself; anything that fails is deleted and rejected.
export async function finalizeImageUpload(input: z.input<typeof finalizeSchema>): Promise<FinalizeResult> {
  await requireAdmin();
  const parsedPath = parseImagePathname(typeof input?.pathname === "string" ? input.pathname : "");
  if (!parsedPath) return { ok: false, message: "업로드 경로가 올바르지 않습니다." };
  const { pathname } = input;

  // Metadata problems are rejected without deleting anything (the file itself may be fine,
  // and this path could belong to an image that content already references).
  const metadata = finalizeSchema.safeParse(input);
  if (!metadata.success) return { ok: false, message: "이미지 크기 정보가 올바르지 않습니다." };

  // File-level failures: the upload itself is not an acceptable image — delete it.
  const reject = async (message: string): Promise<FinalizeResult> => {
    await deleteImages([pathname], "rejected at finalize");
    return { ok: false, message };
  };

  let stored;
  try {
    stored = await head(pathname);
  } catch {
    return { ok: false, message: "업로드된 파일을 찾을 수 없습니다." };
  }

  if (stored.size <= 0 || stored.size > IMAGE_UPLOAD.maxSizeBytes) return reject("파일 크기가 허용 범위를 벗어났습니다.");
  if (stored.contentType !== parsedPath.contentType) return reject("파일 형식이 허용되지 않습니다.");

  const response = await fetch(stored.url, { headers: { range: `bytes=0-${SIGNATURE_BYTES - 1}` }, cache: "no-store" });
  const bytes = new Uint8Array(await response.arrayBuffer()).slice(0, SIGNATURE_BYTES);
  if (detectImageType(bytes) !== parsedPath.contentType) return reject("이미지 파일이 아니거나 확장자와 내용이 다릅니다.");

  return {
    ok: true,
    image: {
      url: stored.url,
      pathname,
      width: metadata.data.width,
      height: metadata.data.height,
      alt: metadata.data.alt,
    },
  };
}

import { IMAGE_UPLOAD, type AllowedImageType } from "@/config/storage";

export type ImageFileCheck =
  | { ok: true; contentType: AllowedImageType; extension: string }
  | { ok: false; error: string };

const isAllowedType = (type: string): type is AllowedImageType =>
  Object.hasOwn(IMAGE_UPLOAD.allowedTypes, type);

// Checks MIME type, extension/MIME agreement and size. The original file name is
// only used for its extension; stored names are generated (see lib/blob/images).
export function checkImageFile(file: { name: string; type: string; size: number }): ImageFileCheck {
  if (!isAllowedType(file.type)) {
    return { ok: false, error: `허용되지 않은 파일 형식입니다: ${file.type || "unknown"}` };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExtensions: readonly string[] = IMAGE_UPLOAD.allowedTypes[file.type];
  if (!allowedExtensions.includes(extension)) {
    return { ok: false, error: "파일 확장자와 형식이 일치하지 않습니다." };
  }

  if (file.size <= 0 || file.size > IMAGE_UPLOAD.maxSizeBytes) {
    const limitMb = IMAGE_UPLOAD.maxSizeBytes / (1024 * 1024);
    return { ok: false, error: `파일 크기는 ${limitMb}MB 이하여야 합니다.` };
  }

  return { ok: true, contentType: file.type, extension: allowedExtensions[0] };
}

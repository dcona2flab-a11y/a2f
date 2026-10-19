import { z } from "zod";

// Login input stays permissive so a malformed username gets the same generic failure.
export const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
  next: z.string().max(500).optional(),
});

export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9._-]{3,32}$/, "아이디는 영문 소문자, 숫자, . _ - 로 3~32자여야 합니다.");

export const newPasswordSchema = z
  .string()
  .min(10, "비밀번호는 10자 이상이어야 합니다.")
  .max(200, "비밀번호는 200자 이하여야 합니다.");

// Stored in the private Blob store (data/admin-auth/). Never the plain password.
export const adminAccountSchema = z.object({
  username: usernameSchema,
  passwordHash: z.string().startsWith("scrypt:"),
  // Changes on every account change; sessions carrying an older epoch are rejected.
  sessionEpoch: z.string().min(8),
});

// /admin/account form, after the current password has been verified.
export const accountChangeSchema = z
  .object({
    username: usernameSchema,
    newPassword: z.union([z.literal(""), newPasswordSchema]),
    confirmPassword: z.string().max(200),
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "새 비밀번호가 일치하지 않습니다.",
  });

"use server";

import { z } from "zod";
import type { SaveOutcome } from "@/components/admin/edit/InlineTextEditor";
import { updateSettings } from "@/lib/admin/content-updates";
import { firstIssue, text } from "@/lib/admin/input";
import { requireAdmin } from "@/lib/auth/session";

// Footer text is edited as one sentence; it is stored as phrases split after each comma,
// which the footer recombines per breakpoint.
const footerSentenceSchema = z
  .string()
  .transform((value) => value.replace(/\s+/g, " ").trim())
  .pipe(z.string().min(1, "푸터 문구를 입력하세요.").max(300, "푸터 문구는 300자 이하여야 합니다."));

function splitFooterSentence(sentence: string): string[] {
  return sentence
    .split(/(?<=,)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function saveFooterText(expectedVersion: number, sentence: string): Promise<SaveOutcome> {
  await requireAdmin();

  const parsed = footerSentenceSchema.safeParse(sentence);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const footerLines = splitFooterSentence(parsed.data);
  if (footerLines.length > 6) return { ok: false, message: "쉼표로 나뉜 구절은 6개 이하여야 합니다." };

  return updateSettings(expectedVersion, (settings) => ({ ...settings, footerLines }));
}

// Home "Evolve your design thinking" contact block. The address is edited one line per row.
const contactInput = z.object({
  address: text("주소", 400, { required: true })
    .transform((value) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(120, "주소: 한 줄은 120자 이하로 입력하세요.")).max(5, "주소: 5줄 이하로 입력하세요.")),
  phone: text("전화번호", 40),
  email: z.union([z.literal(""), z.email("이메일 형식이 올바르지 않습니다.")], "이메일 형식이 올바르지 않습니다."),
});

export async function saveContact(expectedVersion: number, values: z.input<typeof contactInput>): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = contactInput.safeParse({ ...values, email: typeof values?.email === "string" ? values.email.trim() : values?.email });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const { address, phone, email } = parsed.data;
  return updateSettings(expectedVersion, (settings) => ({
    ...settings,
    contact: { addressLines: address, phone, email },
  }));
}

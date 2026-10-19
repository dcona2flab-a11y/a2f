"use server";

import { z } from "zod";
import type { SaveOutcome } from "@/components/admin/edit/InlineTextEditor";
import { HOME_VISUAL_SLOTS } from "@/config/home";
import { updateHome } from "@/lib/admin/content-updates";
import { firstIssue, text, uploadedImage } from "@/lib/admin/input";
import { requireAdmin } from "@/lib/auth/session";

// Home editing (in place on /admin). Each action: requireAdmin → validate → versioned save →
// refresh the public cache (CLAUDE.md §7C).

const paragraphInput = z.object({
  index: z.number().int().min(0).max(1),
  text: text("소개 문단", 600, { required: true }),
});

export async function saveIntroParagraph(expectedVersion: number, index: number, value: string): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = paragraphInput.safeParse({ index, text: value });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  return updateHome(expectedVersion, (home) => {
    const paragraphs = [...home.introduction.paragraphs];
    if (parsed.data.index > paragraphs.length) return { error: "소개 문단을 찾을 수 없습니다." };
    paragraphs[parsed.data.index] = parsed.data.text;
    return { ...home, introduction: { paragraphs } };
  });
}

const whyInput = z.object({
  statementLead: text("강조 문구", 60),
  statement: text("영문 문장", 600, { required: true }),
  description: text("한글 설명", 1000),
});

export async function saveWhy(expectedVersion: number, values: z.input<typeof whyInput>): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = whyInput.safeParse(values);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return updateHome(expectedVersion, (home) => ({ ...home, why: parsed.data }));
}

const researchFieldInput = z.object({
  title: text("영문 제목", 80, { required: true }),
  subtitle: text("한글 소제목", 80),
  description: text("설명", 300),
});

// The six slots are fixed: only their texts change (no add/remove/reorder).
export async function saveResearchField(
  expectedVersion: number,
  id: string,
  values: z.input<typeof researchFieldInput>,
): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = researchFieldInput.safeParse(values);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  return updateHome(expectedVersion, (home) => {
    if (!home.researchFields.some((field) => field.id === id)) return { error: "연구 분야를 찾을 수 없습니다." };
    return {
      ...home,
      researchFields: home.researchFields.map((field) => (field.id === id ? { ...field, ...parsed.data } : field)),
    };
  });
}

const visualInput = z
  .object({
    group: z.enum(["main", "secondary"]),
    index: z.number().int().min(0),
    image: uploadedImage("home"),
  })
  .refine((input) => input.index < HOME_VISUAL_SLOTS[input.group], "이미지 위치가 올바르지 않습니다.");

// Replaces one collage photo. The previous file stays until no kept version references it.
export async function saveHomeVisual(
  expectedVersion: number,
  group: string,
  index: number,
  image: unknown,
): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = visualInput.safeParse({ group, index, image });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const { group: slotGroup, index: slot, image: ref } = parsed.data;
  return updateHome(expectedVersion, (home) => {
    const slots = [...home.visuals[slotGroup]];
    slots[slot] = ref;
    return { ...home, visuals: { ...home.visuals, [slotGroup]: slots } };
  });
}

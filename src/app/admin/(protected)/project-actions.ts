"use server";

import { z } from "zod";
import type { SaveOutcome } from "@/components/admin/edit/InlineTextEditor";
import { AWARD_DEGREES, PROJECT_CATEGORIES } from "@/config/content";
import { updateProjects } from "@/lib/admin/content-updates";
import { firstIssue, text, uploadedImage } from "@/lib/admin/input";
import { requireAdmin } from "@/lib/auth/session";
import { idSchema } from "@/lib/validation/common";
import type { Project } from "@/types/content";

// Project create / edit / delete (/admin/project) and partial saves (/admin/project/[id]).
// requireAdmin → validate → versioned save of projects.json → refresh the public cache.

const summaryFields = {
  title: text("제목", 120, { required: true }),
  date: z.iso.date("날짜를 선택하세요."),
  category: z.enum(PROJECT_CATEGORIES, "카테고리를 선택하세요."),
  customTag: text("태그", 40), // one free-text tag, never a list
};
const bodyField = text("본문", 5000);
const imagesField = z.array(uploadedImage("projects")).max(30, "이미지는 30장 이하로 등록하세요.");
const memberField = z
  .object({
    name: text("멤버 이름", 60, { required: true }),
    degree: z.enum(AWARD_DEGREES, "멤버 학위를 선택하세요."),
    role: text("멤버 역할", 60),
    profileImage: uploadedImage("projects").optional(),
  })
  .nullable(); // at most one member

const projectInput = z.object({
  id: idSchema,
  ...summaryFields,
  body: bodyField,
  images: imagesField,
  member: memberField,
});

export type ProjectInput = z.input<typeof projectInput>;

export async function saveProject(expectedVersion: number, mode: "create" | "update", input: ProjectInput): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = projectInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const project = parsed.data;
  const now = new Date().toISOString();

  return updateProjects(expectedVersion, (items) => {
    const existing = items.find((item) => item.id === project.id);
    if (mode === "create") {
      if (existing) return { error: "이미 등록된 항목입니다. 새로고침 후 다시 시도해 주세요." };
      return [...items, { ...project, createdAt: now, updatedAt: now }];
    }
    if (!existing) return { error: "삭제된 항목입니다. 새로고침 후 확인해 주세요." };
    return items.map((item) => (item.id === project.id ? { ...project, createdAt: item.createdAt, updatedAt: now } : item));
  });
}

// Removes the project; its image files are deleted later, once no kept version references them.
export async function deleteProject(expectedVersion: number, id: string): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, message: "항목을 찾을 수 없습니다." };
  return updateProjects(expectedVersion, (items) => {
    if (!items.some((item) => item.id === parsed.data)) return { error: "이미 삭제된 항목입니다." };
    return items.filter((item) => item.id !== parsed.data);
  });
}

async function updateProject(expectedVersion: number, id: string, patch: Partial<Project>): Promise<SaveOutcome> {
  const now = new Date().toISOString();
  return updateProjects(expectedVersion, (items) => {
    if (!items.some((item) => item.id === id)) return { error: "삭제된 항목입니다. 새로고침 후 확인해 주세요." };
    return items.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: now } : item));
  });
}

const summaryInput = z.object(summaryFields);

export async function saveProjectSummary(expectedVersion: number, id: string, values: z.input<typeof summaryInput>): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = summaryInput.safeParse(values);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return updateProject(expectedVersion, id, parsed.data);
}

export async function saveProjectBody(expectedVersion: number, id: string, body: string): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = bodyField.safeParse(body);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return updateProject(expectedVersion, id, { body: parsed.data });
}

// Order matters: images[0] is the representative image (card and detail).
export async function saveProjectImages(expectedVersion: number, id: string, images: unknown): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = imagesField.safeParse(images);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return updateProject(expectedVersion, id, { images: parsed.data });
}

export async function saveProjectMember(expectedVersion: number, id: string, member: unknown): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = memberField.safeParse(member);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return updateProject(expectedVersion, id, { member: parsed.data });
}

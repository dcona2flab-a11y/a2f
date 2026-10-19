"use server";

import { z } from "zod";
import type { SaveOutcome } from "@/components/admin/edit/InlineTextEditor";
import { LIMITS, MEMBER_TYPES, TEAM_DEGREES } from "@/config/content";
import { PROFESSOR_SECTIONS, type ProfessorSectionKey } from "@/config/team";
import { updateMembers, updateProfessor } from "@/lib/admin/content-updates";
import { firstIssue, text, uploadedImage } from "@/lib/admin/input";
import { requireAdmin } from "@/lib/auth/session";
import { idSchema } from "@/lib/validation/common";
import type { Member, Professor } from "@/types/content";

// /admin/team: team intro, professor profile (professor.json) and Student / Alumni
// (members.json). requireAdmin → validate → versioned save → refresh the public cache.

// Professor ---------------------------------------------------------------

const email = z.union([z.email("이메일 형식이 올바르지 않습니다."), z.literal("")]);
// One entry per line; blank lines are dropped.
const lines = (label: string, max: number) =>
  z
    .string()
    .max(2000, `${label}: 너무 깁니다.`)
    .transform((value) => value.split("\n").map((line) => line.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(max, `${label}: 한 줄은 ${max}자 이하로 입력하세요.`)).max(8, `${label}: 8줄 이하로 입력하세요.`));

async function patchProfessor(expectedVersion: number, patch: Partial<Professor>): Promise<SaveOutcome> {
  return updateProfessor(expectedVersion, (professor) => ({ ...professor, ...patch }));
}

export async function saveTeamIntroText(expectedVersion: number, value: string): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = text("소개 문구", 1000).safeParse(value);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return updateProfessor(expectedVersion, (professor) => ({ ...professor, teamIntro: { ...professor.teamIntro, text: parsed.data } }));
}

export async function saveTeamIntroImage(expectedVersion: number, image: unknown): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = uploadedImage("professor").safeParse(image);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return updateProfessor(expectedVersion, (professor) => ({ ...professor, teamIntro: { ...professor.teamIntro, image: parsed.data } }));
}

const basicsInput = z.object({
  name: text("영문 이름", 80, { required: true }),
  nameKo: text("한글 이름", 40),
  title: text("직함", 40),
  department: text("소속", 80),
});

export async function saveProfessorBasics(expectedVersion: number, values: z.input<typeof basicsInput>): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = basicsInput.safeParse(values);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return patchProfessor(expectedVersion, parsed.data);
}

const contactInput = z.object({
  addressLines: lines("주소", 120),
  phone: text("전화번호", 40),
  email,
});

export async function saveProfessorContact(expectedVersion: number, values: z.input<typeof contactInput>): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = contactInput.safeParse(values);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return patchProfessor(expectedVersion, parsed.data);
}

const imagesField = z
  .array(uploadedImage("professor"))
  .max(LIMITS.professorImages, `사진은 ${LIMITS.professorImages}장까지 등록할 수 있습니다.`);

export async function saveProfessorImages(expectedVersion: number, images: unknown): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = imagesField.safeParse(images);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return patchProfessor(expectedVersion, { images: parsed.data });
}

const sectionKey = z.enum(PROFESSOR_SECTIONS.map((section) => section.key) as [ProfessorSectionKey, ...ProfessorSectionKey[]]);
const sectionLines = z
  .array(text("항목", 300, { required: true }))
  .max(100, "항목은 100개 이하로 입력하세요.");

// Education / Experience / Research / Project: plain text lines (string[]), in order.
export async function saveProfessorSection(expectedVersion: number, key: ProfessorSectionKey, values: unknown): Promise<SaveOutcome> {
  await requireAdmin();
  const parsedKey = sectionKey.safeParse(key);
  if (!parsedKey.success) return { ok: false, message: "항목을 찾을 수 없습니다." };
  const parsed = sectionLines.safeParse(values);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  return patchProfessor(expectedVersion, { [parsedKey.data]: parsed.data });
}

// Student / Alumni --------------------------------------------------------

const memberInput = z.object({
  id: idSchema,
  type: z.enum(MEMBER_TYPES, "구분을 선택하세요."),
  degree: z.enum(TEAM_DEGREES, "학위를 선택하세요."),
  name: text("이름", 60, { required: true }),
  email,
  field: text("연구 분야", 80),
  profileImage: uploadedImage("members").nullable(),
});

export type MemberInput = z.input<typeof memberInput>;

// order = 0, 1, 2 … within each type, in the current display order. Applied after every
// change so the stored values never have gaps or duplicates.
function normalizeOrder(items: Member[]): Member[] {
  const next = new Map<string, number>();
  for (const type of MEMBER_TYPES) {
    items
      .filter((item) => item.type === type)
      .toSorted((a, b) => a.order - b.order)
      .forEach((item, index) => next.set(item.id, index));
  }
  return items.map((item) => ({ ...item, order: next.get(item.id) ?? item.order }));
}

export async function saveMember(expectedVersion: number, mode: "create" | "update", input: MemberInput): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = memberInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const member = parsed.data;
  const now = new Date().toISOString();

  return updateMembers(expectedVersion, (items) => {
    const existing = items.find((item) => item.id === member.id);
    // A new member, or one moved to the other type, goes to the end of its list.
    const lastOrder = (type: Member["type"]) =>
      Math.max(-1, ...items.filter((item) => item.type === type && item.id !== member.id).map((item) => item.order));
    if (mode === "create") {
      if (existing) return { error: "이미 등록된 구성원입니다. 새로고침 후 다시 시도해 주세요." };
      return normalizeOrder([...items, { ...member, order: lastOrder(member.type) + 1, createdAt: now, updatedAt: now }]);
    }
    if (!existing) return { error: "삭제된 구성원입니다. 새로고침 후 확인해 주세요." };
    const order = existing.type === member.type ? existing.order : lastOrder(member.type) + 1;
    return normalizeOrder(
      items.map((item) => (item.id === member.id ? { ...member, order, createdAt: item.createdAt, updatedAt: now } : item)),
    );
  });
}

// Removes the member; the profile photo is deleted later, once no kept version references it.
export async function deleteMember(expectedVersion: number, id: string): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, message: "구성원을 찾을 수 없습니다." };
  return updateMembers(expectedVersion, (items) => {
    if (!items.some((item) => item.id === parsed.data)) return { error: "이미 삭제된 구성원입니다." };
    return normalizeOrder(items.filter((item) => item.id !== parsed.data));
  });
}

// ↑ / ↓: swaps the member with its neighbour of the same type, then renumbers.
export async function moveMember(expectedVersion: number, id: string, direction: "up" | "down"): Promise<SaveOutcome> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || (direction !== "up" && direction !== "down")) return { ok: false, message: "구성원을 찾을 수 없습니다." };
  return updateMembers(expectedVersion, (items) => {
    const target = items.find((item) => item.id === parsed.data);
    if (!target) return { error: "삭제된 구성원입니다. 새로고침 후 확인해 주세요." };
    const list = normalizeOrder(items)
      .filter((item) => item.type === target.type)
      .toSorted((a, b) => a.order - b.order);
    const from = list.findIndex((item) => item.id === target.id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (to < 0 || to >= list.length) return { error: "더 이상 이동할 수 없습니다." };
    const swapped = new Map([
      [list[from].id, to],
      [list[to].id, from],
    ]);
    return normalizeOrder(items).map((item) => (swapped.has(item.id) ? { ...item, order: swapped.get(item.id) ?? item.order } : item));
  });
}

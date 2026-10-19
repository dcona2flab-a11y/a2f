import type { Member, MemberType, Professor } from "@/types/content";
import { getPublishedDocument } from "./content";

export async function getProfessor(): Promise<Professor | null> {
  const document = await getPublishedDocument("professor");
  return document?.data ?? null;
}

export async function getMembers(type: MemberType): Promise<Member[]> {
  const document = await getPublishedDocument("members");
  return (document?.items ?? [])
    .filter((item) => item.type === type)
    .toSorted((a, b) => a.order - b.order);
}

import type { Award, AwardActivityType } from "@/types/content";
import { getPublishedDocument } from "./content";

// Newest first (by award date, then by creation).
export function sortAwardsNewestFirst(items: Award[]): Award[] {
  return items.toSorted((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export async function getAwards(type?: AwardActivityType): Promise<Award[]> {
  const document = await getPublishedDocument("awards");
  const items = document?.items ?? [];
  return sortAwardsNewestFirst(items.filter((item) => !type || item.type === type));
}

export async function getAwardById(id: string): Promise<Award | null> {
  const document = await getPublishedDocument("awards");
  return document?.items.find((item) => item.id === id) ?? null;
}

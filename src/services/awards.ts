import { findAward } from "@/lib/content-paths";
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

// By address segment: the id with or without its prefix (see lib/content-paths).
export async function getAwardBySegment(segment: string): Promise<Award | null> {
  const document = await getPublishedDocument("awards");
  return findAward(document?.items ?? [], segment);
}

import { DEFAULT_CONTENT } from "@/config/defaults";
import type { HomeContent } from "@/types/content";
import { getPublishedDocument } from "./content";

// Research fields in display order. Shared by the public page and the admin (latest data).
export function orderHomeContent(home: HomeContent): HomeContent {
  return { ...home, researchFields: home.researchFields.toSorted((a, b) => a.order - b.order) };
}

// Published Home content; the design defaults until the first save.
export async function getHomeContent(): Promise<HomeContent> {
  const document = await getPublishedDocument("home");
  return orderHomeContent(document?.data ?? DEFAULT_CONTENT.home.data);
}

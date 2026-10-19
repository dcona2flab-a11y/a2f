import { DEFAULT_CONTENT } from "@/config/defaults";
import type { Settings } from "@/types/content";
import { getPublishedDocument } from "./content";

// Published site settings; the defaults until the first save.
export async function getSettings(): Promise<Settings> {
  const document = await getPublishedDocument("settings");
  return document?.data ?? DEFAULT_CONTENT.settings.data;
}

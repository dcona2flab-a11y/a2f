import { sortProjectsNewestFirst } from "@/lib/utils/projects";
import type { Project } from "@/types/content";
import { getPublishedDocument } from "./content";

// All published projects, newest first (the list page filters on the client).
export async function getProjects(): Promise<Project[]> {
  const document = await getPublishedDocument("projects");
  return sortProjectsNewestFirst(document?.items ?? []);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const document = await getPublishedDocument("projects");
  return document?.items.find((item) => item.id === id) ?? null;
}

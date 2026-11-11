import { findProject } from "@/lib/content-paths";
import { sortProjectsNewestFirst } from "@/lib/utils/projects";
import type { Project } from "@/types/content";
import { getPublishedDocument } from "./content";

// All published projects, newest first (the list page filters on the client).
export async function getProjects(): Promise<Project[]> {
  const document = await getPublishedDocument("projects");
  return sortProjectsNewestFirst(document?.items ?? []);
}

// By address segment: the project's own address, or its id with or without the prefix.
export async function getProjectBySegment(segment: string): Promise<Project | null> {
  const document = await getPublishedDocument("projects");
  return findProject(document?.items ?? [], segment);
}

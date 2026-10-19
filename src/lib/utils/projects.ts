import type { Project } from "@/types/content";

// Pure helpers shared by the server (services/projects) and the list's client component.

export const projectYear = (project: Pick<Project, "date">) => Number(project.date.slice(0, 4));

// Newest first (by project date, then by creation).
export function sortProjectsNewestFirst(items: Project[]): Project[] {
  return items.toSorted((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

// Year filter options come from the data, never from a hardcoded list. Newest first.
export function projectYears(items: Pick<Project, "date">[]): number[] {
  return [...new Set(items.map(projectYear))].toSorted((a, b) => b - a);
}

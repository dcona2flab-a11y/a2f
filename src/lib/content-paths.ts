import type { Award, Project } from "@/types/content";

// Public addresses of the detail pages (owner request 2026-11-11). Stored ids keep their prefix
// ("award-…", "project-…"); the address drops it: /news/ljlujb83 (Award & Activity live under /news
// since 2026-11-11, owner request). A project can also have its
// own address (`slug`, e.g. /project/talia), which then wins. Every older or alternative form
// still finds the item, and the pages redirect it to the address below.

const AWARD_PREFIX = "award-";
const PROJECT_PREFIX = "project-";

// Lowercase letters, digits and single hyphens between them (no leading / trailing hyphen).
export const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PROJECT_SLUG_MAX = 60;

const strip = (id: string, prefix: string) => (id.startsWith(prefix) ? id.slice(prefix.length) : id);

export const awardSlug = (award: Pick<Award, "id">) => strip(award.id, AWARD_PREFIX);
export const projectDefaultSlug = (project: Pick<Project, "id">) => strip(project.id, PROJECT_PREFIX);
export const projectSlug = (project: Pick<Project, "id" | "slug">) => project.slug || projectDefaultSlug(project);

export const awardPath = (award: Pick<Award, "id">) => `/news/${awardSlug(award)}`;
export const projectPath = (project: Pick<Project, "id" | "slug">) => `/project/${projectSlug(project)}`;

// An address segment → the item: the full id, the id without its prefix, or a project's slug.
export function findAward<T extends Pick<Award, "id">>(items: T[], segment: string): T | null {
  return items.find((item) => item.id === segment || awardSlug(item) === segment) ?? null;
}

export function findProject<T extends Pick<Project, "id" | "slug">>(items: T[], segment: string): T | null {
  return (
    items.find((item) => item.slug !== "" && item.slug === segment) ??
    items.find((item) => item.id === segment || projectDefaultSlug(item) === segment) ??
    null
  );
}

// Why `slug` cannot be used for the project `id`, or null. Another project's own address and its
// default address are both taken (either would make one of the two unreachable).
export function projectSlugConflict(items: Pick<Project, "id" | "slug">[], id: string, slug: string): string | null {
  if (slug === "") return null;
  const taken = items.some((item) => item.id !== id && (item.slug === slug || projectDefaultSlug(item) === slug));
  return taken ? "주소: 다른 프로젝트가 이미 쓰고 있는 주소입니다." : null;
}

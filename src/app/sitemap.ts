import type { MetadataRoute } from "next";
import { AWARD_DETAIL_AVAILABLE } from "@/config/content";
import { getSiteUrl } from "@/config/site";
import { getAwards } from "@/services/awards";
import { getProjects } from "@/services/projects";

// Public pages plus the detail pages that actually exist (no URLs for empty data).
// Read through the public content cache, so an admin save refreshes it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [awards, projects] = await Promise.all([getAwards(), getProjects()]);
  return [
    { url: `${base}/` },
    { url: `${base}/project` },
    { url: `${base}/team` },
    ...(AWARD_DETAIL_AVAILABLE ? awards.map((award) => ({ url: `${base}/award/${award.id}`, lastModified: award.updatedAt })) : []),
    ...projects.map((project) => ({ url: `${base}/project/${project.id}`, lastModified: project.updatedAt })),
  ];
}

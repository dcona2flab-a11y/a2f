export const SITE = {
  name: "A2F Design Lab",
  // Fallback is empty so a missing value is visible rather than pointing somewhere wrong.
  publicationUrl: process.env.NOTION_PUBLICATION_URL ?? "",
} as const;

const LOCAL_SITE_URL = "http://localhost:3000";

// True only when the final domain is configured explicitly. Until then the site is not
// indexed (robots), so a temporary Vercel address never reaches search engines.
export function isSiteUrlExplicit(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SITE_URL);
}

// The one place absolute site URLs come from (metadataBase, sitemap, robots):
// 1. NEXT_PUBLIC_SITE_URL — the final customer domain (set once when it is decided)
// 2. VERCEL_PROJECT_PRODUCTION_URL — the project's production domain, provided by Vercel
// 3. http://localhost:3000 — local runs
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL; // host name, no protocol
  if (vercel) return `https://${vercel}`;
  return LOCAL_SITE_URL;
}

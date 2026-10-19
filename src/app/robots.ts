import type { MetadataRoute } from "next";
import { getSiteUrl, isSiteUrlExplicit } from "@/config/site";

// Indexing only on the final domain (NEXT_PUBLIC_SITE_URL set): then the sitemap is
// announced. On a fallback address (Vercel production URL, localhost) every page carries
// noindex (root layout metadata). Crawling is not blocked there on purpose: a crawler that
// may not fetch a page never sees its noindex and can still list the bare URL.
export default function robots(): MetadataRoute.Robots {
  if (!isSiteUrlExplicit()) return { rules: { userAgent: "*", disallow: "/admin" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}

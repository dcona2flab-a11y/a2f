"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavBasePath } from "@/config/navigation";
import { toAdminPath, toPublicPath } from "@/lib/admin-paths";

export type ResolvedNavLink = {
  key: string;
  label: string;
  mobileOnly: boolean;
  // null = Publication URL not configured yet (rendered disabled)
  href: string | null;
  external: boolean;
  active: boolean;
};

// Resolves GNB links for the current area: public paths, or their /admin equivalents.
export function useNavLinks(basePath: NavBasePath, publicationUrl: string | null): ResolvedNavLink[] {
  const pathname = usePathname();
  const publicPath = basePath ? toPublicPath(pathname) : pathname;

  return NAV_ITEMS.map((item) => {
    if ("external" in item) {
      return { key: item.key, label: item.label, mobileOnly: false, href: publicationUrl, external: true, active: false };
    }
    const active = item.href === "/" ? publicPath === "/" : publicPath === item.href || publicPath.startsWith(`${item.href}/`);
    return {
      key: item.key,
      label: item.label,
      mobileOnly: item.mobileOnly ?? false,
      href: basePath ? toAdminPath(item.href) : item.href,
      external: false,
      active,
    };
  });
}

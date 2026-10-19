// Public GNB items. Desktop (1440/1920) shows Publication / Project / Team; the hamburger
// panel (365/768) also shows Home. Publication is an external Notion page (NOTION_PUBLICATION_URL).

export type NavItem =
  | { key: "home" | "project" | "team"; label: string; href: string; mobileOnly?: boolean }
  | { key: "publication"; label: string; external: true };

export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Home", href: "/", mobileOnly: true },
  { key: "publication", label: "Publication", external: true },
  { key: "project", label: "Project", href: "/project" },
  { key: "team", label: "Team", href: "/team" },
];

// "" on the public site, "/admin" in admin routes (links go to the admin equivalents).
export type NavBasePath = "" | "/admin";

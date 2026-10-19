// Admin pages mirror public pages one to one: "/" ↔ "/admin", "/project/x" ↔ "/admin/project/x".
// Used by the AdminBar ("view on site") and, later, by the shared public GNB, whose links
// point to the /admin equivalents when rendered inside the admin.

const ADMIN_PREFIX = "/admin";

export function toAdminPath(publicPath: string): string {
  return publicPath === "/" ? ADMIN_PREFIX : `${ADMIN_PREFIX}${publicPath}`;
}

export function toPublicPath(adminPath: string): string {
  if (adminPath === ADMIN_PREFIX) return "/";
  return adminPath.startsWith(`${ADMIN_PREFIX}/`) ? adminPath.slice(ADMIN_PREFIX.length) : "/";
}

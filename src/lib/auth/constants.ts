// Auth values shared by proxy.ts and server code. Keep this file free of Node/Next server
// imports so the proxy can use it without pulling in session or secret handling.

export const ADMIN_SESSION_COOKIE = "a2f_admin_session";
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const LOGIN_FAILURE_DELAY_MS = 1000;

// Where to go after login. Only same-site paths under /admin are allowed; anything else
// (absolute URLs, protocol-relative "//host", backslash tricks, the login page itself)
// falls back to the admin home.
export function safeAdminRedirect(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return ADMIN_HOME_PATH;
  }
  const base = "http://internal.invalid";
  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return ADMIN_HOME_PATH;
  }
  const inAdmin = url.pathname === ADMIN_HOME_PATH || url.pathname.startsWith(`${ADMIN_HOME_PATH}/`);
  if (url.origin !== base || !inAdmin || url.pathname === ADMIN_LOGIN_PATH) return ADMIN_HOME_PATH;
  return `${url.pathname}${url.search}`;
}

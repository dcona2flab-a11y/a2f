import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

// Quick first gate for /admin: without a session cookie, go to the login page.
// It only checks that the cookie exists — the signature and expiry are verified by
// requireAdmin() in the protected admin layout and in every admin Server Action.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  let response: NextResponse;
  if (pathname === ADMIN_LOGIN_PATH || request.cookies.has(ADMIN_SESSION_COOKIE)) {
    response = NextResponse.next();
  } else {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    response = NextResponse.redirect(loginUrl);
  }

  // Keep the whole admin area out of search engines, including redirects.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

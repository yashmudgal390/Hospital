import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "./lib/session";

/**
 * Middleware intercepts all requests matching the config pattern (e.g. /admin/*).
 */
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Set pathname in header so Server Components can read it
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);

  // Create base response
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Handle /admin logic
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const session = await getIronSession<SessionData>(
      req,
      response,
      sessionOptions
    );

    if (!session.isAdmin) {
      url.pathname = "/admin/login";
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

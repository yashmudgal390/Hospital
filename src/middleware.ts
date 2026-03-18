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

  // Allow the /admin/login page without any redirects
  if (path === "/admin/login") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Protect all other /admin routes
  if (path.startsWith("/admin")) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

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

    return response;
  }

  // General pass-through for public routes
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};

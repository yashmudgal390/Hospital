import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "./lib/session";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // We only care about protecting /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Exclude the login page itself from the redirect loop
    if (request.nextUrl.pathname === "/admin/login") {
      return response;
    }

    // Grab the iron-session cookie
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions
    );

    // If the user is not logged in, redirect them to the login page
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Return the unmodified response (deferring all security headers to next.config.js)
  return response;
}

// Optimize the middleware to only run on admin paths
export const config = {
  matcher: ["/admin/:path*"],
};

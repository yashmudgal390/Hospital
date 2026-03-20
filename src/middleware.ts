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

    // Add CSP header to bypass the reported blockage
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.cloudinary.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://res.cloudinary.com;
      font-src 'self' data:;
      connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com;
      frame-src 'self' https://www.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, " ").trim();

    const adminResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    adminResponse.headers.set("Content-Security-Policy", cspHeader);
    return adminResponse;
  }

  // General pass-through for public routes
  const publicResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Apply same CSP to public routes
  const cspHeaderPublic = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.cloudinary.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://res.cloudinary.com;
    font-src 'self' data:;
    connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com;
    frame-src 'self' https://www.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  publicResponse.headers.set("Content-Security-Policy", cspHeaderPublic);
  return publicResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};

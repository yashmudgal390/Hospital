import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const headersList = headers();
  const csp = headersList.get("content-security-policy");

  return NextResponse.json({
    message: "Check the response headers of THIS request in your browser DevTools → Network tab",
    csp_from_request_headers: csp || "NOT SET in request headers (expected — CSP is set on the response)",
    tip: "Open DevTools → Network → click this request → look at 'Response Headers' for Content-Security-Policy",
    timestamp: new Date().toISOString(),
  });
}

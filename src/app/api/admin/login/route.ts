import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyAdminCredentials } from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimit = await checkLoginRateLimit(ip);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // 2. Parse Body
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 3. Verify Credentials (runs in Node runtime for bcrypt)
    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Create iron-session
    const session = await getSession();
    session.isAdmin = true;
    session.adminEmail = email;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Login API Error]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

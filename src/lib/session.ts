import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isAdmin: boolean;
  adminEmail?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32
      ? process.env.SESSION_SECRET
      : "dev-fallback-secret-minimum-32-characters-long",
  cookieName: "clinic_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  },
};


/**
 * Get or create the iron-session for the current request.
 * Used inside API Route handlers (Node.js runtime only — not Edge).
 */
export async function getSession() {
  const cookieStore = cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

/**
 * Check if the current request has a valid admin session.
 * Returns the session data or null.
 */
export async function getAdminSession(): Promise<SessionData | null> {
  const session = await getSession();
  if (!session.isAdmin) return null;
  return session;
}


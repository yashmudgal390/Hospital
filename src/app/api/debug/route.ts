import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const status: any = {
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasCloudinaryCloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      hasCloudinaryApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasCloudinarySecret: !!process.env.CLOUDINARY_API_SECRET,
      hasSessionSecret: !!process.env.SESSION_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || "local",
    },
    database: {
      connected: false,
      error: null,
    },
  };

  try {
    // Try a simple query
    await db.execute(sql`SELECT 1`);
    status.database.connected = true;
  } catch (err: any) {
    status.database.error = err.message || "Unknown DB error";
  }

  return NextResponse.json(status);
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  let extractedPort = "unknown";
  try {
    const portMatch = dbUrl.match(/:(\d+)\//);
    if (portMatch) extractedPort = portMatch[1];
  } catch (e) {}

  const status: any = {
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabaseUrl: !!dbUrl,
      dbPort: extractedPort, // HIGHLIGHT THIS FOR THE USER
      isPoolerPort: extractedPort === "6543",
      hasCloudinary: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      vercelEnv: process.env.VERCEL_ENV || "local",
    },
    database: {
      connected: false,
      error: null,
    },
  };

  try {
    // Race the DB query against a 2-second timeout
    const dbCheck = db.execute(sql`SELECT 1`);
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database connection timed out (2s limit)")), 2000)
    );

    await Promise.race([dbCheck, timeout]);
    status.database.connected = true;
  } catch (err: any) {
    status.database.error = err.message || "Unknown DB error";
  }

  return NextResponse.json(status);
}

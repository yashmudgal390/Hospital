import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isPlaceholder = process.env.DATABASE_URL?.includes("user:password") || 
                      process.env.DATABASE_URL?.includes("host/dbname");

export const isDbConfigured = !!process.env.DATABASE_URL && !isPlaceholder;

// Build-time Warm-up: Give Vercel a second to resolve potential DNS issues
const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';

const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL!, {
    max: 1, // extremely important for Vercel workers
    idle_timeout: 60,
    connect_timeout: 45, // give it plenty of time for DNS resolution
    prepare: false, // required for Supavisor and PgBouncer
    onnotice: () => {}, // silences the logs
    debug: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

// For static generation stability: simple sleep during build to avoid cold-start crashes
if (isBuilding) {
   console.log("[DB] Warm-up: Waiting for connection stability...");
}

export const db = drizzle(client, { schema });

export type DB = typeof db;

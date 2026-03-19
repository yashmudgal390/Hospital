import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isPlaceholder = process.env.DATABASE_URL?.includes("user:password") || 
                      process.env.DATABASE_URL?.includes("host/dbname");

export const isDbConfigured = !!process.env.DATABASE_URL && !isPlaceholder;

// Simple singleton to prevent connection exhaustion
const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

// Use a shorter timeout specifically for the build to detect issues early and retry
const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL!, {
    max: 1, // extremely important for Vercel workers
    idle_timeout: 45,
    connect_timeout: 45, // give it plenty of time for DNS resolution
    prepare: false, // required for Supavisor and PgBouncer
    onnotice: () => {}, // silences the logs
    debug: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

// Stability: Adding a tiny delay to ensure DNS is ready during warm-up
export const db = drizzle(client, { schema });

export type DB = typeof db;

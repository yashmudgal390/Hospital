import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isPlaceholder = process.env.DATABASE_URL?.includes("user:password") || 
                      process.env.DATABASE_URL?.includes("host/dbname");

export const isDbConfigured = !!process.env.DATABASE_URL && !isPlaceholder;

// Use a singleton client to avoid multiple connections during build/HMR
const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL!, {
    max: 1, // very important for serverless/Vercel
    idle_timeout: 30,
    connect_timeout: 30, // more time for cold starts
    prepare: false, // suprevison compatibility
    onnotice: () => {}, // suppress noise
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });

export type DB = typeof db;

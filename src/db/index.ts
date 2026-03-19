import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isPlaceholder = process.env.DATABASE_URL?.includes("user:password") || 
                      process.env.DATABASE_URL?.includes("host/dbname");

export const isDbConfigured = !!process.env.DATABASE_URL && !isPlaceholder;

const client = postgres(process.env.DATABASE_URL!, {
  max: 1,              // important for serverless
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export type DB = typeof db;

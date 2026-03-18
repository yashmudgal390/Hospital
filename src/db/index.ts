import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isPlaceholder = process.env.DATABASE_URL?.includes("user:password") || 
                      process.env.DATABASE_URL?.includes("host/dbname");

export const isDbConfigured = !!process.env.DATABASE_URL && !isPlaceholder;

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export type DB = typeof db;

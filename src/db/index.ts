import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "";
const isPlaceholder = dbUrl.includes("user:password") || dbUrl.includes("host/dbname");
export const isDbConfigured = !!dbUrl && !isPlaceholder;

// Build-time Warm-up: Give Vercel a second to resolve potential DNS issues
const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';

const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

// Lazy initialization of the postgres client to prevent module-import crashes
let client: postgres.Sql;
try {
  if (isDbConfigured) {
    client = globalForDb.client ?? postgres(dbUrl, {
      max: isBuilding ? 1 : 5, 
      idle_timeout: 10,
      connect_timeout: 2, 
      prepare: false, 
      onnotice: () => {}, 
      debug: false,
    });
    if (process.env.NODE_ENV !== "production") globalForDb.client = client;
  } else {
    // Return a dummy client that doesn't crash on import
    client = postgres("postgres://localhost/placeholder", { max: 1 });
  }
} catch (e) {
  // Final fallback to prevent any module-level exceptions
  client = postgres("postgres://localhost/placeholder", { max: 1 });
}

export const db = drizzle(client, { schema });

export type DB = typeof db;

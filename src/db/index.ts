import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "";
const isPlaceholder = dbUrl.includes("user:password") || dbUrl.includes("host/dbname");
export const isDbConfigured = !!dbUrl && !isPlaceholder;

// Build-time Warm-up: Give Vercel a second to resolve potential DNS issues
export const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';

const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

// Lazy initialization of the postgres client to prevent module-import crashes
let client: postgres.Sql;
try {
    // Build-time Hard-Bypass: Don't even try to connect during the build phase
    // to prevent CONNECT_TIMEOUT from crashing the Vercel build process.
    if (isDbConfigured && !isBuilding) {
      client = globalForDb.client ?? postgres(dbUrl, {
        max: 5, 
        idle_timeout: 20,
        connect_timeout: 10, 
        prepare: false, 
        onnotice: () => {}, 
        debug: false,
        ssl: dbUrl.includes("supabase") ? "require" : false,
        transform: {
          undefined: null,
        },
      });
      if (process.env.NODE_ENV !== "production") globalForDb.client = client;
    } else {
      // Return a dummy client for build-time or if not configured
      client = postgres("postgres://localhost/placeholder", { max: 1 });
    }
} catch (e) {
  // Final fallback to prevent any module-level exceptions
  client = postgres("postgres://localhost/placeholder", { max: 1 });
}

export const db = drizzle(client, { schema });

export type DB = typeof db;

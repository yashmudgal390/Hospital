const { db } = require("./src/db/index");
const { sql } = require("drizzle-orm");
const fs = require("fs");

async function check() {
  const result = { tables: [], enums: [], error: null };
  try {
    const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    result.tables = tables;

    const enums = await db.execute(sql`SELECT t.typname FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid GROUP BY t.typname`);
    result.enums = enums;
  } catch (e) {
    result.error = e.message;
  }
  
  fs.writeFileSync("db-audit.json", JSON.stringify(result, null, 2));
  process.exit(0);
}

check();

const { db } = require("./src/db/index");
const { sql } = require("drizzle-orm");
const fs = require("fs");

async function check() {
  const result = { defaults: [], error: null };
  try {
    const defaults = await db.execute(sql`SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'contact_messages'`);
    result.defaults = defaults;
  } catch (e) {
    result.error = e.message;
  }
  
  fs.writeFileSync("default-audit.json", JSON.stringify(result, null, 2));
  process.exit(0);
}

check();

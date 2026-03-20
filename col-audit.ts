const { db } = require("./src/db/index");
const { sql } = require("drizzle-orm");
const fs = require("fs");

async function check() {
  const result = { columns: [], error: null };
  try {
    const columns = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contact_messages'`);
    result.columns = columns;
  } catch (e) {
    result.error = e.message;
  }
  
  fs.writeFileSync("col-audit.json", JSON.stringify(result, null, 2));
  process.exit(0);
}

check();

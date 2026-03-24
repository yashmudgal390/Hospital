const postgres = require('postgres');
const url = 'postgresql://postgres:f60rCUVOocVRDzhd@db.cmewkwqoxwriafbijnph.supabase.co:5432/postgres';

const sql = postgres(url, {
  ssl: 'require',
  max: 1
});

async function main() {
  try {
    const res = await sql`SELECT 1 as result`;
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    process.exit(0);
  }
}

main();

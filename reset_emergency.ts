process.env.DATABASE_URL="postgresql://postgres.cmewkwqoxwriafbijnph:f60rCUVOocVRDzhd@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function run() {
  const { db } = require("./src/db");
  const { settings } = require("./src/db/schema");
  const { eq } = require("drizzle-orm");

  await db.update(settings).set({ 
    emergencyPhone: "+91 98765 43210", 
    phone: "+91 98765 43210", 
    whatsapp: "+91 98765 43210" 
  }).where(eq(settings.id, "main"));
  console.log("Updated DB successfully!");
  process.exit(0);
}
run();

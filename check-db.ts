import { db } from "./src/db/index";
import { settings } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  const [s] = await db.select().from(settings).where(eq(settings.id, "main")).limit(1);
  console.log("DATABASE_SETTINGS:", JSON.stringify(s, null, 2));
  process.exit(0);
}

check();

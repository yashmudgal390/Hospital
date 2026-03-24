import { db } from "./src/db";
import { settings } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const [s] = await db.select().from(settings).where(eq(settings.id, "main"));
  if (!s) {
    console.log("No settings found");
    return;
  }
  
  let needsUpdate = false;
  const updates: any = {};
  
  for (const [key, value] of Object.entries(s)) {
    if (typeof value === 'string' && value.length > 2000) {
      console.log(`Found huge string in ${key}! Length: ${value.length}`);
      updates[key] = null;
      needsUpdate = true;
    }
  }
  
  if (needsUpdate) {
    await db.update(settings).set(updates).where(eq(settings.id, "main"));
    console.log("Cleaned up massive strings!");
  } else {
    console.log("No massive strings found in settings.");
  }
}

main().catch(console.error).finally(() => process.exit(0));

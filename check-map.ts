
import { db } from "./src/db";
import { settings } from "./src/db/schema/settings";
import { eq } from "drizzle-orm";

async function checkMapUrl() {
  try {
    const [res] = await db.select({ mapEmbedUrl: settings.mapEmbedUrl }).from(settings).where(eq(settings.id, "main")).limit(1);
    console.log("Current Map Embed URL:", res?.mapEmbedUrl || "NULL");
  } catch (e) {
    console.error(e);
  }
}

checkMapUrl();

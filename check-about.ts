
import { db } from "./src/db";
import { settings } from "./src/db/schema/settings";
import { eq } from "drizzle-orm";

async function checkAboutImage() {
  try {
    const [res] = await db.select({ aboutImageUrl: settings.aboutImageUrl }).from(settings).where(eq(settings.id, "main")).limit(1);
    if (!res?.aboutImageUrl) {
      console.log("No about image found");
      return;
    }
    console.log(`About Image: ${(res.aboutImageUrl.length / 1024).toFixed(2)} KB ${res.aboutImageUrl.startsWith('data:') ? '(BASE64)' : ''}`);
  } catch (e) {
    console.error(e);
  }
}

checkAboutImage();

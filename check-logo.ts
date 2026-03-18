
import { db } from "./src/db";
import { settings } from "./src/db/schema/settings";

async function checkLogoSize() {
  try {
    const [res] = await db.select({ logoUrl: settings.logoUrl }).from(settings).limit(1);
    if (!res?.logoUrl) {
      console.log("No logo found");
      return;
    }
    console.log(`Logo: ${(res.logoUrl.length / 1024).toFixed(2)} KB ${res.logoUrl.startsWith('data:') ? '(BASE64)' : ''}`);
  } catch (e) {
    console.error(e);
  }
}

checkLogoSize();


import { db } from "./src/db";
import { settings } from "./src/db/schema/settings";

async function checkDataSize() {
  try {
    const [res] = await db.select().from(settings).limit(1);
    if (!res) {
      console.log("No settings found");
      return;
    }

    console.log("--- Settings Data Size ---");
    for (const [key, value] of Object.entries(res)) {
      if (typeof value === "string") {
        const sizeKB = (value.length / 1024).toFixed(2);
        if (parseFloat(sizeKB) > 1) {
          console.log(`${key}: ${sizeKB} KB ${value.startsWith('data:') ? '(BASE64)' : ''}`);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

checkDataSize();


import { db } from "./src/db";
import { services } from "./src/db/schema/services";

async function checkServicesSize() {
  try {
    const res = await db.select().from(services);
    
    console.log("--- Services Table ---");
    res.forEach(s => {
      const imgSize = (s.imageUrl?.length || 0) / 1024;
      if (imgSize > 1) {
        console.log(`Service: ${s.name}, Image: ${imgSize.toFixed(2)} KB ${s.imageUrl?.startsWith('data:') ? '(BASE64)' : ''}`);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

checkServicesSize();

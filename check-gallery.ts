
import { db } from "./src/db";
import { gallery } from "./src/db/schema/gallery";

async function checkGallerySize() {
  try {
    const res = await db.select().from(gallery);
    
    console.log("--- Gallery Table ---");
    res.forEach(g => {
      const imgSize = (g.imageUrl?.length || 0) / 1024;
      if (imgSize > 10) {
        console.log(`Gallery ID: ${g.id}, Category: ${g.category}, Image: ${imgSize.toFixed(2)} KB ${g.imageUrl?.startsWith('data:') ? '(BASE64)' : ''}`);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

checkGallerySize();

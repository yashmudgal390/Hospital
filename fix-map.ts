
import { db } from "./src/db";
import { settings } from "./src/db/schema/settings";
import { eq } from "drizzle-orm";

async function fixMapInDb() {
  try {
    const clinicName = "AMRENDRA HOSPITAL";
    const address = "MAIN CHAWLA, BUS STAND, PLOT NO 4, GURGAON ROAD, Old Roshanpura Extension, Todarmal Colony, Najafgarh, Delhi, 110043";
    const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(clinicName + " " + address)}&output=embed`;
    
    await db.update(settings).set({
      clinicName,
      address,
      mapEmbedUrl,
      updatedAt: new Date()
    }).where(eq(settings.id, "main"));

    console.log("Database updated successfully with correct map embed URL and clinic details.");
  } catch (e) {
    console.error(e);
  }
}

fixMapInDb();

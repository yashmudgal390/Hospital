
import { db } from "./src/db";
import { settings } from "./src/db/schema/settings";
import { eq } from "drizzle-orm";

async function checkClinicName() {
  try {
    const [res] = await db.select({ clinicName: settings.clinicName, address: settings.address }).from(settings).where(eq(settings.id, "main")).limit(1);
    console.log("Clinic Name:", res?.clinicName || "NULL");
    console.log("Address:", res?.address || "NULL");
  } catch (e) {
    console.error(e);
  }
}

checkClinicName();

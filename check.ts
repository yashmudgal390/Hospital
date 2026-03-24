import { db } from "./src/db";
import { settings } from "./src/db/schema";

async function check() {
  const s = await db.select().from(settings).limit(1);
  if (!s[0]) {
    console.log("No settings");
    return;
  }
  const docL = s[0].doctorPhotoUrl?.length || 0;
  const heroL = s[0].heroImageUrl?.length || 0;
  const aboutL = s[0].aboutImageUrl?.length || 0;
  console.log("doctorPhotoUrl len:", docL);
  console.log("heroImageUrl len:", heroL);
  console.log("aboutImageUrl len:", aboutL);
  console.log("emergencyPhone:", s[0].emergencyPhone);
  process.exit(0);
}
check();

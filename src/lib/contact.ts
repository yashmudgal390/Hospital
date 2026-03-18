import { unstable_cache } from "next/cache"
import { db } from "@/db"
import { settings } from "@/db/schema/settings"

export const getContactInfo = unstable_cache(
  async () => {
    try {
      const result = await db.select({
        clinicName: settings.clinicName,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        email: settings.email,
        address: settings.address,
        operatingHours: settings.operatingHours,
        mapEmbedUrl: settings.mapEmbedUrl,
        appointmentsEnabled: settings.appointmentsEnabled,
      }).from(settings).limit(1);
      return result[0] ?? null;
    } catch (e) {
      console.warn("[getContactInfo] Cache fetch error:", e);
      return null;
    }
  },
  ["contact-info"],
  { revalidate: 3600, tags: ["settings"] }
)

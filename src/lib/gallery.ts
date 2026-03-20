import { unstable_cache } from "next/cache"
import { db } from "@/db"
import { gallery } from "@/db/schema/gallery"
import { eq, asc } from "drizzle-orm"

export const getGalleryImages = unstable_cache(
  async () => {
    try {
      return await db.select().from(gallery)
        .where(eq(gallery.isActive, true))
        .orderBy(asc(gallery.sortOrder))
    } catch (err) {
      console.error("[getGalleryImages] Error:", err);
      return [];
    }
  },
  ["gallery-images"],
  { revalidate: 3600, tags: ["gallery"] }
)

import { unstable_cache } from "next/cache"
import { db } from "@/db"
import { services } from "@/db/schema/services"
import { eq, asc } from "drizzle-orm"

export const getServices = unstable_cache(
  async () => {
    return await db.select().from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder))
  },
  ["services-list"],
  { revalidate: 3600, tags: ["services"] }
)

export const getServiceBySlug = unstable_cache(
  async (slug: string) => {
    const result = await db.select().from(services)
      .where(eq(services.slug, slug))
      .limit(1)
    return result[0] ?? null
  },
  ["service-detail"],
  { revalidate: 3600, tags: ["services"] }
)

export const getNavServices = unstable_cache(
  async () => {
    return await db
      .select({ name: services.name, slug: services.slug })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder));
  },
  ["nav-services"],
  { revalidate: 3600, tags: ["services"] }
)

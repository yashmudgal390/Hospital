import { unstable_cache } from "next/cache"
import { db, isDbConfigured, isBuilding } from "@/db"
import { blog } from "@/db/schema/blog"
import { eq, desc, and, ne } from "drizzle-orm"

export const getBlogPosts = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return [];
    try {
      return await db.select().from(blog)
        .where(eq(blog.isPublished, true))
        .orderBy(desc(blog.publishedAt))
    } catch (e) {
      console.error("[getBlogPosts] Error:", e);
      return [];
    }
  },
  ["blog-posts"],
  { revalidate: 3600, tags: ["blog"] }
)

export const getBlogPostBySlug = unstable_cache(
  async (slug: string) => {
    if (!isDbConfigured || isBuilding) return null;
    try {
      const result = await db.select().from(blog)
        .where(eq(blog.slug, slug))
        .limit(1)
      return result[0] ?? null
    } catch (e) {
      console.error("[getBlogPostBySlug] Error:", e);
      return null;
    }
  },
  ["blog-post-detail"],
  { revalidate: 3600, tags: ["blog"] }
)

export const getRelatedPosts = unstable_cache(
  async (excludedId: string) => {
    if (!isDbConfigured || isBuilding) return [];
    try {
      return await db
        .select({
          title: blog.title,
          slug: blog.slug,
          coverImageUrl: blog.coverImageUrl,
          publishedAt: blog.publishedAt,
        })
        .from(blog)
        .where(and(eq(blog.isPublished, true), ne(blog.id, excludedId)))
        .orderBy(desc(blog.publishedAt))
        .limit(3);
    } catch (e) {
      console.error("[getRelatedPosts] Error:", e);
      return [];
    }
  },
  ["related-posts"],
  { revalidate: 3600, tags: ["blog"] }
)

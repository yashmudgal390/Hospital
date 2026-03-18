import { Metadata } from "next";
import { db, isDbConfigured } from "@/db";
import { blog } from "@/db/schema";
import { desc } from "drizzle-orm";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog Management | Admin",
};

export const revalidate = 0;

export default async function BlogPage() {
  let data: any[] = [];

  if (isDbConfigured) {
    try {
      data = await db
        .select({
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          category: blog.category,
          isPublished: blog.isPublished,
          publishedAt: blog.publishedAt,
          createdAt: blog.createdAt,
        })
        .from(blog)
        .orderBy(desc(blog.createdAt));
    } catch (err) {
      console.warn("[BlogPage] DB error:", (err as Error).message);
    }
  }

  return <BlogClient data={data} />;
}

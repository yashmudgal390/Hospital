import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * blog — blog / news articles written and published by the doctor
 */
export const blog = pgTable(
  "blog",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    // Content
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(), // HTML from TipTap editor
    coverImageUrl: text("cover_image_url"),

    // Categorization
    category: text("category").notNull().default("General"),
    tags: text("tags"), // JSON array stored as text: ["tag1", "tag2"]
    readingTimeMinutes: integer("reading_time_minutes").default(3),

    // Publication
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: index("blog_slug_idx").on(table.slug),
    publishedIdx: index("blog_published_idx").on(table.isPublished),
    publishedAtIdx: index("blog_published_at_idx").on(table.publishedAt),
  })
);

export type BlogPost = typeof blog.$inferSelect;
export type NewBlogPost = typeof blog.$inferInsert;

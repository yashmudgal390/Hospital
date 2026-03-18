import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * gallery — clinic photo gallery managed from the admin panel
 */
export const gallery = pgTable(
  "gallery",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    // Image
    imageUrl: text("image_url").notNull(),
    cloudinaryPublicId: text("cloudinary_public_id"), // for deletion via Cloudinary API
    altText: text("alt_text").notNull().default(""),
    caption: text("caption"),

    // Categorization
    category: text("category").notNull().default("General"),

    // Ordering & visibility
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    categoryIdx: index("gallery_category_idx").on(table.category),
    activeIdx: index("gallery_active_idx").on(table.isActive),
    sortOrderIdx: index("gallery_sort_order_idx").on(table.sortOrder),
  })
);

export type GalleryItem = typeof gallery.$inferSelect;
export type NewGalleryItem = typeof gallery.$inferInsert;

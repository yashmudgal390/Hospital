import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * reviews — customer testimonials submitted on the public site
 */
export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(), // nanoId-ready
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

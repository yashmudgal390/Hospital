import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const messageStatusEnum = pgEnum("message_status", [
  "unread",
  "read",
  "replied",
  "archived",
]);

/**
 * contact_messages — general contact form submissions
 */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    // Sender
    senderName: text("sender_name").notNull(),
    senderEmail: text("sender_email").notNull(),
    senderPhone: text("sender_phone"),

    // Message
    subject: text("subject").notNull(),
    message: text("message").notNull(),

    // Admin management
    status: messageStatusEnum("status").notNull().default("unread"),
    adminNotes: text("admin_notes"),
    isStarred: boolean("is_starred").notNull().default(false),

    // IP for rate limiting audit
    ipAddress: text("ip_address"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("contact_messages_status_idx").on(table.status),
    createdAtIdx: index("contact_messages_created_at_idx").on(table.createdAt),
    starredIdx: index("contact_messages_starred_idx").on(table.isStarred),
  })
);

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type MessageStatus = (typeof messageStatusEnum.enumValues)[number];

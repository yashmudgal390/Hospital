import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

/**
 * appointments — appointment requests submitted via the public contact form
 */
export const appointments = pgTable(
  "appointments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    // Patient information
    patientName: text("patient_name").notNull(),
    patientPhone: text("patient_phone").notNull(),
    patientEmail: text("patient_email"),
    patientAge: text("patient_age"),
    patientGender: text("patient_gender"), // "male" | "female" | "other"

    // Appointment details
    preferredDate: text("preferred_date").notNull(), // ISO date string YYYY-MM-DD
    preferredTime: text("preferred_time"), // e.g. "10:00 AM"
    serviceId: text("service_id"), // optional reference — no FK constraint for flexibility
    serviceName: text("service_name"), // denormalized for display
    reasonForVisit: text("reason_for_visit"),

    // Callback request flag
    isCallbackRequest: boolean("is_callback_request").notNull().default(false),

    // Admin management
    status: appointmentStatusEnum("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("appointments_status_idx").on(table.status),
    dateIdx: index("appointments_date_idx").on(table.preferredDate),
    createdAtIdx: index("appointments_created_at_idx").on(table.createdAt),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];

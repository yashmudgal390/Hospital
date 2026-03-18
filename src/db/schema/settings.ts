import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * settings — singleton row (always id = 'main')
 * All editable clinic metadata lives here.
 */
export const settings = pgTable("settings", {
  id: text("id").primaryKey().default("main"),

  // Hospital identity
  clinicName: text("clinic_name").notNull().default("My Hospital"),
  tagline: text("tagline").notNull().default("Your Health, Our Priority"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),

  // Doctor info
  doctorName: text("doctor_name").notNull().default("Dr. Name"),
  doctorTitle: text("doctor_title").notNull().default("MBBS, MD"),
  doctorSpecialty: text("doctor_specialty").notNull().default("General Physician"),
  doctorBio: text("doctor_bio"),
  doctorPhotoUrl: text("doctor_photo_url"),
  doctorExperience: integer("doctor_experience").default(0), // years
  doctorQualifications: text("doctor_qualifications"), // JSON array stored as text

  // Contact
  phone: text("phone").notNull().default("+1 (555) 000-0000"),
  whatsapp: text("whatsapp"),
  email: text("email").notNull().default("info@hospital.com"),
  address: text("address").notNull().default("123 Main St, City, State 00000"),
  mapEmbedUrl: text("map_embed_url"),

  // Operating hours (JSON stored as text)
  // Shape: { mon:"9:00 AM–5:00 PM", tue:"...", ..., sun:"Closed" }
  operatingHours: text("operating_hours"),

  // Social links
  facebook: text("facebook"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  youtube: text("youtube"),
  linkedin: text("linkedin"),

  // Hero section
  heroHeadline: text("hero_headline"),
  heroSubheadline: text("hero_subheadline"),
  heroImageUrl: text("hero_image_url"),
  heroCTAText: text("hero_cta_text").default("Book Appointment"),
  heroCTALink: text("hero_cta_link").default("/contact"),

  // About page
  aboutText: text("about_text"),
  aboutImageUrl: text("about_image_url"),
  missionText: text("mission_text"),
  visionText: text("vision_text"),

  // Emergency section
  emergencyPhone: text("emergency_phone"),
  emergencyNote: text("emergency_note"),
  showEmergencyBanner: boolean("show_emergency_banner").default(true),

  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  ogImageUrl: text("og_image_url"),
  googleAnalyticsId: text("google_analytics_id"),

  // Appointment form — toggle on/off
  appointmentsEnabled: boolean("appointments_enabled").default(true),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

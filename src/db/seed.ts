/**
 * Seed script — run once after `npx drizzle-kit push`
 * Usage: npx tsx src/db/seed.ts
 *
 * Inserts the default settings row if it doesn't exist yet.
 */
import { db } from "./index";
import { settings } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Upsert the singleton settings row
  await db
    .insert(settings)
    .values({
      id: "main",
      clinicName: "Dr. Healing Clinic",
      tagline: "Compassionate Care, Trusted Expertise",
      doctorName: "Dr. Jane Smith",
      doctorTitle: "MBBS, MD (Internal Medicine)",
      doctorSpecialty: "Internal Medicine & General Physician",
      doctorBio:
        "Dr. Jane Smith is a board-certified Internal Medicine specialist with over 15 years of experience providing compassionate, patient-centered care to families in the community. She believes in treating the whole person — not just the illness.",
      doctorExperience: 15,
      doctorQualifications: JSON.stringify([
        "MBBS — Medical University, 2005",
        "MD Internal Medicine — General Hospital, 2009",
        "Fellow, American College of Physicians",
      ]),
      phone: "+1 (555) 123-4567",
      whatsapp: "+15551234567",
      email: "info@drsmithclinic.com",
      address: "123 Health Avenue, Suite 200, Springfield, IL 62701",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.5!2d-89.65!3d39.78!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDQ2JzQ4LjAiTiA4OcKwMzknMDAuMCJX!5e0!3m2!1sen!2sus!4v1234567890",
      operatingHours: JSON.stringify({
        mon: "9:00 AM – 6:00 PM",
        tue: "9:00 AM – 6:00 PM",
        wed: "9:00 AM – 6:00 PM",
        thu: "9:00 AM – 6:00 PM",
        fri: "9:00 AM – 5:00 PM",
        sat: "10:00 AM – 2:00 PM",
        sun: "Closed",
      }),
      heroHeadline: "Your Health is Our\nHighest Priority",
      heroSubheadline:
        "Expert, compassionate medical care for you and your whole family. Book your appointment today and experience healthcare the way it should be.",
      heroCTAText: "Book an Appointment",
      heroCTALink: "/contact",
      aboutText:
        "Welcome to Dr. Smith's Clinic — a patient-first practice dedicated to providing comprehensive, evidence-based healthcare in a warm and welcoming environment. We take the time to listen, understand, and treat every patient as an individual.",
      missionText:
        "To deliver exceptional, compassionate healthcare that empowers patients to live healthier, fuller lives.",
      visionText:
        "To be the most trusted medical practice in the community, recognized for clinical excellence and genuine patient care.",
      emergencyPhone: "+1 (555) 911-0000",
      emergencyNote:
        "For life-threatening emergencies, please call 911 immediately.",
      showEmergencyBanner: true,
      appointmentsEnabled: true,
      metaTitle: "Dr. Jane Smith Clinic — Internal Medicine & General Practice",
      metaDescription:
        "Compassionate, expert medical care in Springfield. Book an appointment with Dr. Jane Smith, board-certified Internal Medicine specialist.",
      metaKeywords:
        "doctor, clinic, internal medicine, general practitioner, Springfield, healthcare",
    })
    .onConflictDoNothing();

  console.log("✅ Settings row seeded.");
  console.log("🎉 Database seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

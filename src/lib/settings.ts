// Bypass Next.js aggressive caching to ensure admin updates are instantly visible
const unstable_cache = <T extends (...args: any[]) => Promise<any>>(cb: T, keys?: string[], opts?: any) => cb;
import { db, isDbConfigured, isBuilding } from "@/db"
import { settings } from "@/db/schema/settings"

const FALLBACK_SETTINGS = {
  clinicName: "Dr. Clinic",
  tagline: "Compassionate Care for Your Family",
  aboutText: "Welcome to our clinic.",
  missionText: "To provide the best care.",
  visionText: "A healthy community.",
  doctorName: "Dr. Medical",
  doctorTitle: "Specialist",
  doctorSpecialty: "General Medicine",
  doctorBio: "Expert medical care.",
  doctorExperience: "10+ Years",
  doctorQualifications: "MD",
} as const;

const FALLBACK_LAYOUT = {
  clinicName: "Dr. Clinic",
  tagline: "Compassionate Care for Your Family",
  logoUrl: null,
  faviconUrl: null,
  phone: "+91",
  email: "contact@clinic.com",
  address: "123 Health Ave",
  operatingHours: {},
  emergencyPhone: null,
  showEmergencyBanner: false,
  appointmentsEnabled: true,
  mapEmbedUrl: null,
} as const;

// 1. Textual Content (Fast)
export const getClinicSettings = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return FALLBACK_SETTINGS as any;
    try {
      const result = await db.select({
        clinicName: settings.clinicName,
        tagline: settings.tagline,
        aboutText: settings.aboutText,
        missionText: settings.missionText,
        visionText: settings.visionText,
        doctorName: settings.doctorName,
        doctorTitle: settings.doctorTitle,
        doctorSpecialty: settings.doctorSpecialty,
        doctorBio: settings.doctorBio,
        doctorExperience: settings.doctorExperience,
        doctorQualifications: settings.doctorQualifications,
      }).from(settings).limit(1)
      return result[0] ?? null
    } catch (e) {
      console.warn("[getClinicSettings] error:", e);
      return FALLBACK_SETTINGS as any;
    }
  },
  ["clinic-settings"],
  { revalidate: 3600, tags: ["settings"] }
)

// 2. Metadata (Tiny) - SAFE TO CACHE
export const getSiteMetadata = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return FALLBACK_SETTINGS as any;
    try {
      const [res] = await db
        .select({
          clinicName: settings.clinicName,
          doctorName: settings.doctorName,
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
        })
        .from(settings)
        .limit(1);
      return res ?? null;
    } catch(e) {
      return null;
    }
  },
  ["clinic-metadata"],
  { revalidate: 3600, tags: ["settings"] }
)

// 3. Layout Essentials
export const getLayoutSettings = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return FALLBACK_SETTINGS as any;
    try {
      const [res] = await db.select({
        clinicName: settings.clinicName,
        tagline: settings.tagline,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        operatingHours: settings.operatingHours,
        emergencyPhone: settings.emergencyPhone,
        showEmergencyBanner: settings.showEmergencyBanner,
        appointmentsEnabled: settings.appointmentsEnabled,
        mapEmbedUrl: settings.mapEmbedUrl,
      }).from(settings).limit(1);
      return res ?? null;
    } catch (e) {
      console.warn("[getLayoutSettings] error:", e);
      return FALLBACK_LAYOUT as any;
    }
  },
  ["layout-settings"],
  { revalidate: 3600, tags: ["settings"] }
)

// 4. Home Page Content (Fast - Text only)
export const getHomeSettings = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return FALLBACK_SETTINGS as any;
    try {
      const [res] = await db.select({
        heroHeadline: settings.heroHeadline,
        heroSubheadline: settings.heroSubheadline,
        heroCTAText: settings.heroCTAText,
        heroCTALink: settings.heroCTALink,
        doctorName: settings.doctorName,
        doctorTitle: settings.doctorTitle,
        doctorExperience: settings.doctorExperience,
        doctorBio: settings.doctorBio,
      }).from(settings).limit(1);
      return res ?? null;
    } catch (e) {
      console.warn("[getHomeSettings] error:", e);
      return null;
    }
  },
  ["home-settings"],
  { revalidate: 3600, tags: ["settings"] }
)

// 5. Individual Image Fetchers (Fast when cached)
export const getDoctorPhoto = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return FALLBACK_SETTINGS as any;
    try {
       const [res] = await db.select({ url: settings.doctorPhotoUrl }).from(settings).limit(1);
       return res?.url ?? null;
    } catch(e) { return null; }
  },
  ["doctor-photo"],
  { revalidate: 3600, tags: ["settings"] }
)

export const getHeroImage = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return FALLBACK_SETTINGS as any;
    try {
       const [res] = await db.select({ url: settings.heroImageUrl }).from(settings).limit(1);
       return res?.url ?? null;
    } catch(e) { return null; }
  },
  ["hero-image"],
  { revalidate: 3600, tags: ["settings"] }
)

export const getAboutImage = unstable_cache(
  async () => {
    if (!isDbConfigured || isBuilding) return FALLBACK_SETTINGS as any;
    try {
       const [res] = await db.select({ url: settings.aboutImageUrl }).from(settings).limit(1);
       return res?.url ?? null;
    } catch(e) { return null; }
  },
  ["about-image"],
  { revalidate: 3600, tags: ["settings"] }
)

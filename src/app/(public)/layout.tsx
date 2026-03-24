import { Navbar } from "@/components/layout/Navbar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { isDbConfigured } from "@/db";
import { getClinicSettings, getLayoutSettings } from "@/lib/settings";
import { getNavServices } from "@/lib/services";

export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let siteSettings: any = {
    clinicName: "Hospital",
    tagline: "Your health is our priority.",
    logoUrl: null,
    emergencyPhone: "",
    showEmergencyBanner: false,
    appointmentsEnabled: true,
    phone: "Contact Us",
    email: "",
    address: "Medical Clinic",
    operatingHours: "{}",
  };
  let activeServices: any[] = [];

  if (isDbConfigured) {
    try {
      const [dbSettings, dbServices] = await Promise.all([
        getLayoutSettings(),
        getNavServices()
      ]);

      if (dbSettings) siteSettings = { ...siteSettings, ...dbSettings };
      activeServices = dbServices || [];
    } catch (err) {
      console.warn("[PublicLayout] error:", (err as Error).message);
    }
  }

  return (
    <>
      <TopBar settings={siteSettings as any} />
      <Navbar settings={siteSettings as any} />
      
      {/* Main content area expands to push footer down if content is short */}
      <main className="flex-grow flex flex-col">{children}</main>
      
      <Footer settings={siteSettings as any} services={activeServices} />
      <AccessibilityToolbar />
    </>
  );
}


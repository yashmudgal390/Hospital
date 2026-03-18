import { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getContactInfo } from "@/lib/contact";
import { getServices } from "@/lib/services";
import { getClinicSettings, getSiteMetadata } from "@/lib/settings";
import { getValidMapEmbedUrl } from "@/lib/utils";
import { ContactForm } from "./ContactForm";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteMetadata();
  
  return {
    title: `Contact Us | ${s?.clinicName || "Clinic"}`,
    description: "Get in touch or book an appointment online.",
  };
}

export default async function ContactPage() {
  const [dbContact, activeServices] = await Promise.all([
    getContactInfo(),
    getServices()
  ]);

  let s: any = dbContact || {};

  let parsedHours: Record<string, string> = {};
  if (s.operatingHours) {
    try {
      parsedHours = JSON.parse(s.operatingHours);
    } catch (e) {}
  }

  const days = [
    { key: "mon", label: "Monday" },
    { key: "tue", label: "Tuesday" },
    { key: "wed", label: "Wednesday" },
    { key: "thu", label: "Thursday" },
    { key: "fri", label: "Friday" },
    { key: "sat", label: "Saturday" },
    { key: "sun", label: "Sunday" },
  ];

  return (
    <>
      <section className="bg-brand-bg pt-20 pb-16 border-b border-brand-border text-center overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-brand-100/50 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-text mb-4">Get in Touch</h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Book an appointment, ask a question, or simply drop by. We're here to help.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-bg -z-10" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-card border border-brand-border overflow-hidden">
            <div className="grid lg:grid-cols-5 items-stretch">
              
              {/* Left Side: Contact Info & Hours */}
              <div className="lg:col-span-2 bg-gradient-brand p-10 md:p-12 text-white relative overflow-hidden">
                <div className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                
                <h2 className="text-2xl font-heading font-bold mb-8 relative z-10">Contact Information</h2>
                
                <div className="space-y-6 relative z-10 mb-12">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 rounded-xl shrink-0 mt-1">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white/90 text-sm mb-1 uppercase tracking-wider">Location</h3>
                      <p className="leading-relaxed">{s.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 rounded-xl shrink-0 mt-1">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white/90 text-sm mb-1 uppercase tracking-wider">Phone</h3>
                      <a href={`tel:${s.phone?.replace(/[^\d+]/g, "")}`} className="hover:text-brand-100 transition-colors block mb-1">
                        {s.phone}
                      </a>
                      {s.whatsapp && (
                        <a href={`https://wa.me/${s.whatsapp.replace(/[^\d+]/g, "")}`} className="text-sm text-green-300 hover:text-green-200 transition-colors">
                          WhatsApp Available
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 rounded-xl shrink-0 mt-1">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white/90 text-sm mb-1 uppercase tracking-wider">Email</h3>
                      <a href={`mailto:${s.email}`} className="hover:text-brand-100 transition-colors">
                        {s.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 border-t border-white/20 pt-8">
                  <h3 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-white/80" /> Opening Hours
                  </h3>
                  <ul className="space-y-3">
                    {days.map(({ key, label }) => {
                      const hoursStr = parsedHours[key] || "Closed";
                      const isClosed = hoursStr.toLowerCase() === "closed";
                      return (
                        <li key={key} className="flex justify-between items-center text-sm border-b border-white/10 pb-2 last:border-0 last:pb-0">
                          <span className="text-brand-100">{label}</span>
                          <span className={isClosed ? "text-red-300 font-medium" : "text-white"}>
                            {hoursStr}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Right Side: Form Component */}
              <div className="lg:col-span-3 p-10 md:p-14">
                <ContactForm 
                  services={activeServices} 
                  appointmentsEnabled={s.appointmentsEnabled ?? true} 
                />
              </div>

            </div>
          </div>
        </div>
      </section>

    </>
  );
}

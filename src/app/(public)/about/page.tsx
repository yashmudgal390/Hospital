import { Metadata } from "next";
import NextImage from "next/image";
import { CheckCircle2, HeartPulse, GraduationCap, Award, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { isDbConfigured } from "@/db";
import { getClinicSettings, getSiteMetadata, getDoctorPhoto, getAboutImage } from "@/lib/settings";

export const revalidate = 3600; // Enable ISR for better performance

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteMetadata();

  return {
    title: `About ${s?.doctorName || "the Doctor"} | ${s?.clinicName || "Hospital"}`,
    description: s?.metaDescription || "Read about our hospital and expert doctor.",
  };
}

export default async function AboutPage() {
  let s: any = null;

  if (isDbConfigured) {
    s = await getClinicSettings();
  }

  if (!s) s = {};

  // Parse JSON qualifications safely
  let qualifications: string[] = [];
  try {
    if (s.doctorQualifications) {
      qualifications = JSON.parse(s.doctorQualifications);
    }
  } catch (e) {
    // Ignore parse errors
  }

  return (
    <>
      {/* Header */}
      <section className="bg-brand-bg pt-20 pb-16 border-b border-brand-border text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-text mb-4">
            {s.clinicName ? `About ${s.clinicName}` : "About Us"}
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            {s.tagline}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Image Side */}
            <div className="relative isolate">
              <div className="absolute inset-0 bg-gradient-brand rounded-2xl -rotate-3 scale-105 opacity-20 -z-10" />
              <Suspense fallback={
                <div className="w-full aspect-[4/3] bg-brand-50 rounded-2xl animate-pulse flex items-center justify-center border border-brand-border">
                   <Loader2 className="h-10 w-10 text-brand-primary/20 animate-spin" />
                </div>
              }>
                <AboutImageWrapper />
              </Suspense>
              
            </div>

            {/* Text Side */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-heading font-bold text-brand-text mb-6">Our Hospital</h2>
                <div className="prose prose-brand text-brand-text/90">
                  <p className="leading-relaxed text-lg">{s.aboutText}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-brand-border">
                <div className="bg-brand-50 p-6 rounded-xl border border-brand-100">
                  <h3 className="font-heading font-bold text-brand-primary text-xl mb-3 flex items-center gap-2">
                    <HeartPulse className="h-5 w-5" /> Mission
                  </h3>
                  <p className="text-sm text-brand-text/80 leading-relaxed">{s.missionText}</p>
                </div>
                <div className="bg-brand-50 p-6 rounded-xl border border-brand-100">
                  <h3 className="font-heading font-bold text-brand-secondary text-xl mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Vision
                  </h3>
                  <p className="text-sm text-brand-text/80 leading-relaxed">{s.visionText}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Doctor Profile */}
      <section className="py-24 bg-brand-bg relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-[2.5rem] shadow-card border border-brand-border overflow-hidden max-w-5xl mx-auto">
            <div className="grid md:grid-cols-[400px_1fr] items-stretch">
              {/* Doctor Image - Maximized Circle */}
              <div className="flex items-center justify-center bg-brand-50 border-r border-brand-border min-h-[400px]">
                <div className="relative w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-full overflow-hidden border-4 border-white shadow-2xl ring-1 ring-brand-border/50 isolate">
                    <div className="absolute inset-0 bg-gradient-brand opacity-10 -z-10" />
                    <Suspense fallback={
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-50 animate-pulse">
                        <Loader2 className="h-10 w-10 text-brand-primary/20 animate-spin" />
                      </div>
                    }>
                      <DoctorImageWrapper name={s.doctorName} />
                    </Suspense>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <div className="inline-block px-3 py-1 bg-brand-50 text-brand-primary text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
                  {s.doctorTitle}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-text mb-2">
                  {s.doctorName}
                </h2>
                <h3 className="text-xl text-brand-secondary font-medium mb-8 pb-8 border-b border-brand-border">
                  {s.doctorSpecialty}
                </h3>
                
                <p className="text-brand-text/80 leading-relaxed text-lg mb-10">
                  {s.doctorBio}
                </p>

                {qualifications.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-brand-text mb-4 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-brand-primary" />
                      Education & Credentials
                    </h4>
                    <ul className="space-y-3">
                      {qualifications.map((qual, i) => (
                        <li key={i} className="flex items-start gap-3 text-brand-text/80 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** 
 * Separate async component to fetch large interior image 
 */
async function AboutImageWrapper() {
  const url = await getAboutImage();
  
  if (!url) {
    return (
      <div className="w-full aspect-[4/3] bg-brand-50 rounded-2xl shadow-inner border border-brand-border flex items-center justify-center">
        <HeartPulse className="h-16 w-16 text-brand-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl shadow-card overflow-hidden aspect-[4/3] z-10">
      <NextImage 
        src={url} 
        alt="Hospital Interior" 
        fill 
        className="object-cover" 
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

/** 
 * Separate async component to fetch large doctor photo 
 */
async function DoctorImageWrapper({ name }: { name: string }) {
  const url = await getDoctorPhoto();
  
  if (!url) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-primary opacity-50">
        <GraduationCap className="h-20 w-20 mb-2" />
        <span className="font-medium">Photo</span>
      </div>
    );
  }

  return (
    <NextImage 
      src={url} 
      alt={name} 
      fill 
      className="object-cover object-center hover:scale-110 transition-transform duration-700" 
      sizes="(max-width: 768px) 300px, 400px"
    />
  );
}

import { Metadata } from "next";
import Link from "next/link";
import NextImage from "next/image";
import { isDbConfigured } from "@/db";
import { getServices } from "@/lib/services";
import { getClinicSettings, getSiteMetadata } from "@/lib/settings";
import { ArrowRight, HeartPulse } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteMetadata();

  return {
    title: `Medical Services | ${s?.clinicName || "Hospital"}`,
    description: "Explore our comprehensive range of medical services designed to keep you and your family healthy.",
  };
}

export default async function ServicesPage() {
  let allServices: any[] = [];
  if (isDbConfigured) {
    allServices = await getServices();
  }

  return (
    <>
      <section className="bg-brand-bg pt-20 pb-16 border-b border-brand-border text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-text mb-4">Our Services</h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Comprehensive, compassionate medical care tailored to your unique health needs.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {allServices.length === 0 ? (
            <div className="text-center py-20 bg-brand-50 rounded-2xl border border-brand-border">
              <HeartPulse className="h-16 w-16 mx-auto text-brand-primary opacity-30 mb-4" />
              <h2 className="text-2xl font-heading font-semibold text-brand-text mb-2">No Services Yet</h2>
              <p className="text-brand-muted">Services will appear here once added from the admin panel.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-[3/2] bg-brand-50 overflow-hidden">
                    {service.imageUrl ? (
                      <NextImage
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <HeartPulse className="h-16 w-16 text-brand-primary opacity-20" />
                      </div>
                    )}
                    {service.isFeatured && (
                      <div className="absolute top-4 right-4 bg-brand-amber text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <h2 className="text-2xl font-heading font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors">
                      {service.name}
                    </h2>
                    <p className="text-brand-muted leading-relaxed flex-grow">
                      {service.shortDescription}
                    </p>
                    <div className="mt-8 pt-6 border-t border-brand-border flex items-center text-brand-secondary font-medium group-hover:text-brand-primary transition-colors">
                      Learn more
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

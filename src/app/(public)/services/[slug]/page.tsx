import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HeartPulse, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getServiceBySlug } from "@/lib/services";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);

  if (!service || !service.isActive) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.metaTitle || `${service.name} | Medical Services`,
    description: service.metaDescription || service.shortDescription,
  };
}

export default async function ServiceDetailsPage({ params }: Props) {
  const service = await getServiceBySlug(params.slug);

  if (!service || !service.isActive) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-brand-bg">
      {/* Breadcrumb / Simple Header */}
      <div className="bg-white border-b border-brand-border py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Link
            href="/services"
            className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-4 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Services
          </Link>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-text">
            {service.name}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12 items-start">
          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Prominent Service Image */}
            {service.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-card border border-brand-border bg-white">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card border border-brand-border">
              <h2 className="text-2xl font-heading font-bold text-brand-text mb-6 pb-4 border-b border-brand-border">
                Service Overview
              </h2>
              {service.fullDescription ? (
                <div
                  className="rendered-content prose prose-teal max-w-none text-brand-text/90"
                  dangerouslySetInnerHTML={{ __html: service.fullDescription || "" }}
                />
              ) : (
                <p className="text-lg text-brand-text/90 leading-relaxed">
                  {service.shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="sticky top-24 space-y-8">
            {/* Booking Card */}
            <div className="bg-brand-primary rounded-3xl p-8 text-center text-white shadow-button">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HeartPulse className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">
                Need this service?
              </h3>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">
                Book a consultation today to discuss your health needs with our specialist.
              </p>
              <Button
                asChild
                className="w-full bg-white text-brand-primary hover:bg-brand-50 rounded-pill h-14 text-base font-bold transition-all shadow-md"
              >
                <Link href={`/contact?focus=appointment&service=${service.id}`}>
                  Book Appointment
                </Link>
              </Button>
            </div>
            
            {/* Quality Checklist */}
            <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm">
               <h4 className="font-heading font-bold text-brand-text mb-6 text-lg">Why Choose Us?</h4>
               <ul className="space-y-4">
                 {[
                   "State-of-the-Art Medical Equipment",
                   "Board Certified Specialists",
                   "Personalized Treatment Plans",
                   "Comprehensive Follow-up Care"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm text-brand-muted">
                     <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-brand-primary">
                       <CheckCircle2 className="h-3.5 w-3.5" />
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

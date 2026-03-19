import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, TrendingUp, HeartPulse, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { isDbConfigured } from "@/db";
import { getClinicSettings, getHomeSettings, getDoctorPhoto, getHeroImage } from "@/lib/settings";
import { Loader2 } from "lucide-react";
import { getServices } from "@/lib/services";
import { getBlogPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import dynamic from "next/dynamic";

const Antigravity = dynamic(() => import("@/components/ui/Antigravity"), { 
  ssr: false 
});

export const revalidate = 3600;

export default async function HomePage() {
  let siteSettings: Awaited<ReturnType<typeof getHomeSettings>> = null;
  let featuredServices: any[] = [];
  let latestPosts: any[] = [];

  if (isDbConfigured) {
    try {
      const [settingsRes, servicesRes, blogRes] = await Promise.all([
        getHomeSettings(),
        getServices(),
        getBlogPosts()
      ]);

      siteSettings = settingsRes;
      featuredServices = Array.isArray(servicesRes) ? servicesRes.slice(0, 4) : [];
      latestPosts = Array.isArray(blogRes) ? blogRes.slice(0, 3) : [];
    } catch (err) {
      // Log error internally but allow site to render with fallbacks
    }
  }

  const s = siteSettings || ({} as Exclude<typeof siteSettings, null>);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-24 md:pt-16 md:pb-32">
        {/* Antigravity Background */}
        <div className="absolute inset-0 -z-10 opacity-70">
           <Antigravity
            count={150}
            magnetRadius={8}
            ringRadius={10}
            waveSpeed={0.5}
            waveAmplitude={1.5}
            particleSize={2.5}
            lerpSpeed={0.08}
            color="#4f46e5" // Vibrant Indigo/Blue
            autoAnimate
            particleVariance={1.5}
            rotationSpeed={0.1}
            depthFactor={1.2}
            pulseSpeed={3}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              {s.tagline && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-brand-surface border border-brand-border text-sm font-medium text-brand-primary shadow-sm mb-4">
                  <HeartPulse className="h-4 w-4" />
                  <span>{s.tagline}</span>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-brand-text leading-tight whitespace-pre-line">
                {s.heroHeadline}
              </h1>
              <p className="text-lg md:text-xl text-brand-muted leading-relaxed max-w-lg">
                {s.heroSubheadline}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-secondary text-white rounded-pill px-6 md:px-8 h-14 text-base shadow-button hover:shadow-button-hover transition-all min-w-[180px]">
                  <Link href={s.heroCTALink || "/contact"} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">🩺</span>
                    <span>{s.heroCTAText || "Book Now"}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-pill px-8 h-14 text-base border-brand-primary/20 text-brand-text hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all bg-white/50 backdrop-blur-sm">
                  <Link href="/about">About Us</Link>
                </Button>
              </div>

              {/* Added subtle features to fill space */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-8 border-t border-brand-border/30">
                {s.doctorSpecialty && (
                   <div className="flex items-center gap-3 group">
                    <div className="h-10 w-10 flex items-center justify-center text-brand-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-brand-text">{s.doctorSpecialty}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 group">
                  <div className="h-10 w-10 flex items-center justify-center text-brand-primary">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand-text">Personalized Care</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-brand rounded-[2rem] transform rotate-3 scale-105 opacity-20 blur-xl"></div>
              <Suspense fallback={
                <div className="relative rounded-[2.5rem] bg-brand-50 animate-pulse w-full aspect-[4/3] md:aspect-[16/9] flex items-center justify-center border border-brand-border">
                  <Loader2 className="h-10 w-10 text-brand-primary/20 animate-spin" />
                </div>
              }>
                <HeroImageWrapper headline={s.heroHeadline} />
              </Suspense>
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white rounded-2xl p-6 shadow-dropdown border border-brand-border z-20 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-heading font-bold text-brand-text">
                      {s.doctorExperience}+
                    </div>
                    <div className="text-sm font-medium text-brand-muted">
                      Years Experience
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features Section */}
      <section className="py-12 bg-white relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-24">
            <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all border border-brand-border group">
              <div className="h-12 w-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-brand-text group-hover:text-brand-primary transition-colors">Flexible Scheduling</h3>
              <p className="text-brand-muted text-sm leading-relaxed">Book appointments at times that work for you, including weekend availability.</p>
            </div>
            <div className="bg-brand-primary rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-white group">
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-all">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-white">Expert Care</h3>
              <p className="text-white/80 text-sm leading-relaxed">Dedicated to providing the highest quality evidence-based medical treatments.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all border border-brand-border group">
              <div className="h-12 w-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2 text-brand-text group-hover:text-brand-primary transition-colors">Patient-Centric</h3>
              <p className="text-brand-muted text-sm leading-relaxed">Compassionate care tailored to your specific health needs and goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 md:py-28 bg-brand-bg relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-text mb-4">Our Medical Services</h2>
            <p className="text-lg text-brand-muted">Comprehensive care for your entire family under one roof.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map(service => (
              <div key={service.id} className="bg-white rounded-card p-6 shadow-sm hover:shadow-card border border-brand-border transition-all group">
                {service.imageUrl ? (
                   <div className="w-full h-48 relative overflow-hidden rounded-xl mb-6">
                     <Image 
                      src={service.imageUrl} 
                      alt={service.name} 
                      fill 
                      className="object-cover" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                     />
                   </div>
                ) : (
                  <div className="w-full h-48 bg-brand-50 rounded-xl mb-6 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                     <HeartPulse className="h-12 w-12 text-brand-primary opacity-50" />
                  </div>
                )}
                <h3 className="font-heading font-semibold text-xl mb-2 text-brand-text group-hover:text-brand-primary transition-colors">{service.name}</h3>
                <p className="text-brand-muted text-sm mb-4 line-clamp-2">{service.shortDescription}</p>
                <Link href={`/services/${service.slug}`} className="text-brand-primary font-medium flex items-center gap-1 hover:text-brand-secondary transition-colors text-sm">
                  View Details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-pill border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="py-24 bg-white border-t border-brand-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-text mb-4">Latest From Our Blog</h2>
                <p className="text-lg text-brand-muted">Expert health advice and hospital news from our medical team.</p>
              </div>
              <Button asChild variant="ghost" className="text-brand-primary hover:text-brand-secondary hover:bg-brand-50 rounded-pill font-bold">
                <Link href="/blog" className="flex items-center gap-2">
                  View All Articles <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-brand-border shadow-sm hover:shadow-card transition-all h-full"
                >
                  <div className="relative h-56 overflow-hidden bg-brand-50">
                    {post.coverImageUrl ? (
                      <img 
                        src={post.coverImageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-brand opacity-10">
                        <HeartPulse className="h-12 w-12 text-brand-primary opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-text text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs font-semibold text-brand-muted mb-4 opacity-70">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.publishedAt ? formatDate(post.publishedAt) : "Recently"}
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-brand-muted text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="text-brand-secondary font-bold text-sm flex items-center gap-1 group-hover:text-brand-primary">
                      Read More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctor Intro CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-gradient-brand rounded-[2.5rem] overflow-hidden shadow-card">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-10 md:p-16 flex flex-col justify-center text-white">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Meet {s.doctorName}</h2>
                <h3 className="text-xl text-white/90 mb-6 font-medium">{s.doctorTitle}</h3>
                <p className="text-white/80 leading-relaxed mb-8 text-lg">
                  {s.doctorBio ? s.doctorBio.substring(0, 150) + "..." : "Compassionate care you can trust."}
                </p>
                <div>
                  <Button asChild className="bg-white text-brand-primary hover:bg-brand-50 rounded-pill px-8" size="lg">
                    <Link href="/about">Read Full Profile</Link>
                  </Button>
                </div>
              </div>
              {/* Doctor Image - Maximized Circle */}
              <div className="flex items-center justify-center min-h-[500px] md:min-h-[600px] bg-white/5">
                <div className="relative w-[340px] h-[340px] md:w-[480px] md:h-[480px] rounded-full overflow-hidden border-4 border-white/30 shadow-2xl ring-1 ring-white/10 isolate">
                  <div className="absolute inset-0 bg-white/5 mix-blend-overlay z-10"></div>
                  <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
                      <Loader2 className="h-12 w-12 text-white/20 animate-spin" />
                    </div>
                  }>
                    <HomeDoctorSection name={s.doctorName} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Separate component to fetch and render the Hero Image
 */
async function HeroImageWrapper({ headline }: { headline: string | null }) {
  const url = await getHeroImage();

  if (!url) {
    return (
      <div className="relative rounded-[2rem] shadow-card bg-white border border-brand-border w-full aspect-[4/5] md:h-[600px] flex items-center justify-center text-brand-muted z-10">
        <div className="text-center">
          <HeartPulse className="h-16 w-16 mx-auto mb-4 text-brand-primary opacity-50" />
          <p>Hero Image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-[2.5rem] shadow-xl overflow-hidden w-full aspect-[4/3] md:aspect-[16/9] z-10 transition-all duration-700 hover:shadow-2xl">
      <Image
        src={url}
        alt={headline || "Hospital Hero"}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
    </div>
  );
}

/**
 * Separate component to fetch and render the Doctor Photo on Home
 */
async function HomeDoctorSection({ name }: { name: string | null }) {
  const url = await getDoctorPhoto();

  if (!url) {
    return (
      <div className="absolute inset-0 w-full h-full bg-brand-50/10 flex flex-col items-center justify-center text-white/50">
          <span className="text-8xl mb-4">🩺</span>
          <span className="font-heading font-bold text-xl uppercase tracking-widest">Profile</span>
      </div>
    );
  }

  return (
    <Image 
      src={url} 
      alt={name} 
      fill 
      className="object-cover object-center hover:scale-110 transition-transform duration-700" 
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}

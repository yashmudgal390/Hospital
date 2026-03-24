"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowRight, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/db/schema/settings";

interface FooterProps {
  settings: Settings;
  services: { name: string; slug: string }[];
}

export function Footer({ settings, services }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Parse operating hours
  let parsedHours: Record<string, string> = {};
  if (settings?.operatingHours) {
    try {
      parsedHours = JSON.parse(settings.operatingHours);
    } catch (e) {
      console.error("Failed to parse hours for footer");
    }
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
    <footer className="bg-brand-text text-white relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-brand"></div>

      <div className="container mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-12">
          
          {/* Column 1: Hospital Identity & Summary */}
          <div className="space-y-6 text-brand-primary">
            <Link href="/" className="flex items-center gap-3 group inline-block">
              {settings?.logoUrl ? (
                <div className="relative h-12 w-32 brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity">
                  <Image
                    src={settings.logoUrl}
                    alt={settings.clinicName || "Clinic"}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-brand-primary rounded-lg flex items-center justify-center text-white">
                    <HeartPulse className="h-6 w-6" />
                  </div>
                  <span className="font-heading font-bold text-xl tracking-tight text-white group-hover:text-brand-200 transition-colors">
                    {settings?.clinicName}
                  </span>
                </div>
              )}
            </Link>
            
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              {settings.tagline || (settings.metaDescription?.substring(0, 100) + "...")}
            </p>

            <div className="space-y-3">
              <a
                href={`tel:${(settings?.phone || "").replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="bg-white/10 p-2 rounded-full group-hover:bg-brand-primary transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span>{settings?.phone || "Contact Us"}</span>
              </a>
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <div className="bg-white/10 p-2 rounded-full group-hover:bg-brand-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>{settings.email}</span>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-start gap-3 text-gray-300 group pt-1">
                  <div className="bg-white/10 p-2 rounded-full mt-0.5 flex-shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm leading-relaxed">{settings.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h3 className="font-heading font-semibold text-lg pb-2 border-b border-white/10 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {["Home", "About Us", "Services", "Photo Gallery", "Health Blog", "Contact Us"].map(
                (item, i) => {
                  const hrefs = ["/", "/about", "/services", "/gallery", "/blog", "/contact"];
                  return (
                    <li key={item}>
                      <Link
                        href={hrefs[i]}
                        className="text-gray-300 hover:text-brand-primary flex items-center gap-2 transition-colors text-sm group"
                      >
                        <ArrowRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-primary" />
                        {item}
                      </Link>
                    </li>
                  );
                }
              )}
            </ul>
          </div>

          {/* Column 3: Medical Services */}
          <div className="space-y-6">
            <h3 className="font-heading font-semibold text-lg pb-2 border-b border-white/10 inline-block">
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-gray-300 hover:text-brand-primary flex items-center gap-2 transition-colors text-sm group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-primary" />
                    {service.name}
                  </Link>
                </li>
              ))}
              {services.length > 6 && (
                <li>
                  <Link
                    href="/services"
                    className="text-brand-primary hover:text-brand-200 mt-2 block text-sm font-medium"
                  >
                    View All Services &rarr;
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            &copy; {currentYear} {settings.clinicName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/admin/login" className="hover:text-brand-primary transition-colors">
              Doctor Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

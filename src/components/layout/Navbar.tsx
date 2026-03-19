"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, PhoneCall, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  settings: {
    clinicName: string;
    logoUrl: string | null;
    emergencyPhone: string | null;
    showEmergencyBanner: boolean;
    appointmentsEnabled: boolean;
  };
}

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Gallery", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Navbar({ settings }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Scroll effect for glassy nav
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Emergency Banner (Optional) */}
      {settings?.showEmergencyBanner && settings?.emergencyPhone && (
        <div className="bg-brand-emergency text-white text-center text-sm font-medium py-2 px-4 animate-fade-in flex items-center justify-center gap-2">
          <PhoneCall className="h-4 w-4 animate-pulse" />
          <span>
            Emergency? Call us immediately at{" "}
            <a
              href={`tel:${settings.emergencyPhone.replace(/[^\d+]/g, "")}`}
              className="underline font-bold hover:text-brand-background transition"
            >
              {settings.emergencyPhone}
            </a>
          </span>
        </div>
      )}

      {/* Main Navigation */}
      <nav
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-border py-3"
            : "bg-white py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo / Hospital Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings?.logoUrl ? (
              <div className="relative h-10 w-32">
                <Image
                  src={settings.logoUrl}
                  alt={settings.clinicName || "Clinic"}
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                  priority
                />
              </div>
            ) : (
              <div className="h-10 w-10 bg-gradient-brand text-white rounded-lg flex items-center justify-center font-heading font-bold text-xl shadow-button">
                {(settings?.clinicName || "H").charAt(0)}
              </div>
            )}
            <span className="font-heading font-bold text-xl md:text-2xl text-brand-text tracking-tight group-hover:text-brand-primary transition-colors">
              {settings?.clinicName}
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname?.startsWith(link.href));

                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-brand-primary relative py-2",
                        isActive ? "text-brand-primary" : "text-brand-text"
                      )}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop CTAs */}
            <div className="flex items-center gap-3 border-l border-brand-border pl-6">
              {settings?.appointmentsEnabled && (
                <Button
                  asChild
                  className="bg-brand-primary hover:bg-brand-secondary text-white shadow-button hover:shadow-button-hover rounded-pill transition-all"
                >
                  <Link href="/contact?focus=appointment">Book Appointment</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-brand-text hover:text-brand-primary transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-brand-border shadow-lg animate-accordion-down origin-top overflow-hidden">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname?.startsWith(link.href));
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className={cn(
                          "block px-4 py-3 rounded-md text-base font-medium transition-colors",
                          isActive
                            ? "bg-brand-bg text-brand-primary"
                            : "text-brand-text hover:bg-gray-50 hover:text-brand-primary"
                        )}
                      >
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-brand-border pt-4 px-4 flex flex-col gap-3">
                {settings.appointmentsEnabled && (
                  <Button
                    asChild
                    className="w-full bg-brand-primary text-white rounded-pill justify-center"
                    size="lg"
                  >
                    <Link href="/contact?focus=appointment">
                      Book Appointment
                    </Link>
                  </Button>
                )}
                {settings.emergencyPhone && (
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-brand-emergency text-brand-emergency hover:bg-brand-emergency hover:text-white rounded-pill justify-center gap-2"
                  >
                    <a href={`tel:${settings.emergencyPhone.replace(/[^\d+]/g, "")}`}>
                      <Phone className="h-4 w-4" />
                      Emergency Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

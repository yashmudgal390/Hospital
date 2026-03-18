"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TopBarProps {
  settings: {
    phone?: string;
    email?: string;
    address?: string;
    operatingHours?: string;
    mapEmbedUrl?: string;
  };
}

export function TopBar({ settings }: TopBarProps) {
  const [mounted, setMounted] = useState(false);
  const [todayHours, setTodayHours] = useState("9:00 AM – 5:00 PM");

  useEffect(() => {
    setMounted(true);
    if (settings?.operatingHours) {
      try {
        const hours = JSON.parse(settings.operatingHours);
        const day = new Date()
          .toLocaleDateString("en-US", { weekday: "short" })
          .toLowerCase();
        if (hours[day]) {
          setTodayHours(hours[day]);
        }
      } catch (e) {
        // Fallback already set
      }
    }
  }, [settings?.operatingHours]);

  const phone = settings?.phone || "Contact Us";
  const email = settings?.email || "";
  const address = settings?.address || "Medical Clinic";
  const mapEmbedUrl = settings?.mapEmbedUrl;

  return (
    <div className="bg-brand-primary text-white text-xs font-medium py-2 hidden md:block">
      <div className="container mx-auto px-4 flex justify-between items-center h-full">
        {/* Left Side: Contact Info */}
        <div className="flex items-center gap-6">
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-2 hover:text-brand-secondary transition-colors"
          >
            <Phone className="h-3.5 w-3.5 opacity-80" />
            <span>{phone}</span>
          </a>
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 hover:text-brand-secondary transition-colors"
            >
              <Mail className="h-3.5 w-3.5 opacity-80" />
              <span>{email}</span>
            </a>
          )}
          <div className="flex items-center gap-2 opacity-90">
            <Clock className="h-3.5 w-3.5 opacity-80" />
            <span>Today: {mounted ? todayHours : "9:00 AM – 5:00 PM"}</span>
          </div>
        </div>

        {/* Right Side: Address & Map Link */}
        <div className="flex items-center gap-4">
          <a
            href={
              mapEmbedUrl
                ? mapEmbedUrl
                : `https://maps.google.com/?q=${encodeURIComponent(
                    address
                  )}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-brand-secondary transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 opacity-80" />
            <span>{address}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

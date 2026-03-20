import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string to a human-readable locale string */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  if (!date) return "Recently";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", options);
}

/** Format a date to relative time (e.g., "3 days ago") */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "Recently";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Recently";
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMonths >= 12) return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  if (diffDays >= 30) return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  if (diffHours >= 24) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffMins >= 60) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffSecs >= 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  
  return "just now";
}

/** Generate an SEO-friendly slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncate text to a maximum length with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/** Strip HTML tags from a string (for excerpt generation) */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Estimate reading time in minutes */
export function estimateReadingTime(text: string): number {
  const WORDS_PER_MINUTE = 200;
  const wordCount = stripHtml(text).split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/** Parse a JSON string safely, returning a fallback on failure */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Format a phone number for tel: links (strips non-digits except leading +) */
export function formatTelLink(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

/** Format number with thousands separator */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Build absolute URL from a path */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Operating hours day labels */
export const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** Appointment status color mapping */
export const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
} as const;

/** Message status color mapping */
export const MSG_STATUS_COLORS = {
  unread: "bg-teal-100 text-teal-700 border-teal-200",
  read: "bg-gray-100 text-gray-700 border-gray-200",
  replied: "bg-green-100 text-green-700 border-green-200",
  archived: "bg-slate-100 text-slate-700 border-slate-200",
} as const;

/**
 * Ensures a Google Maps URL is in the correct format for an iframe [src].
 * Handles cases where users paste the full <iframe> tag or a regular link.
 */
export function getValidMapEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  let cleaned = url.trim();

  // 1. Check if user pasted the entire <iframe> tag
  if (cleaned.toLowerCase().includes("<iframe")) {
    const match = cleaned.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 2. Already an embed URL
  if (cleaned.includes("/maps/embed") || cleaned.includes("output=embed")) {
    return cleaned;
  }

  // 3. Common Search Link -> Search Embed (Legacy format that often still works without API key)
  if (cleaned.includes("google.com/maps") || cleaned.includes("maps.app.goo.gl")) {
     // If it's a short link or a regular view link, we can't easily transform it 
     // to a functional /embed?pb=... without the Embed API.
     // But we can try the old format as a fallback.
     if (cleaned.includes("maps.app.goo.gl")) {
        // We can't transform short links safely. Return as is (will fail) or null?
        // Let's keep it as is, but we should inform the user in the admin panel.
        return cleaned; 
     }
     
     // Try to transform https://www.google.com/maps/place/Address to a search embed
     const placeMatch = cleaned.match(/\/maps\/place\/([^/]+)/);
     if (placeMatch && placeMatch[1]) {
        return `https://maps.google.com/maps?q=${placeMatch[1]}&output=embed`;
     }
  }

  return cleaned;
}

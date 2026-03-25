"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CalendarCheck, MessageSquare, Star } from "lucide-react";
import { playAdminChime } from "@/lib/sounds";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

interface NotificationItem {
  type: "message" | "appointment" | "review";
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
}

export function AdminNotificationPoller() {
  const router = useRouter();
  // Track the last time we polled, so we only show NEW items
  const lastPollRef = useRef<string>(new Date().toISOString());
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(
          `/api/admin/notifications?since=${encodeURIComponent(lastPollRef.current)}`,
          { cache: "no-store" }
        );

        if (!res.ok) return;

        const data = await res.json();
        const items: NotificationItem[] = data.items ?? [];

        // Update the since timestamp for the next poll
        lastPollRef.current = new Date().toISOString();

        // Filter to truly unseen items first
        const unseenItems = items.filter((item) => !seenIdsRef.current.has(item.id));

        // Play chime once if there are any new notifications
        if (unseenItems.length > 0) {
          playAdminChime();
        }

        // Fire a toast for each unseen item
        items.forEach((item) => {
          if (seenIdsRef.current.has(item.id)) return;
          seenIdsRef.current.add(item.id);

          const Icon =
            item.type === "message" ? MessageSquare
            : item.type === "review" ? Star
            : CalendarCheck;
          const iconColor =
            item.type === "message" ? "text-blue-500"
            : item.type === "review" ? "text-amber-500"
            : "text-green-500";

          toast.custom(
            (t) => (
              <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-lg border border-gray-100 w-80">
                <div className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-gray-50 ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                  <button
                    className="text-xs font-medium text-brand-primary hover:underline mt-1 inline-block"
                    onClick={() => {
                      toast.dismiss(t);
                      router.push(item.href);
                    }}
                  >
                    View →
                  </button>
                </div>
              </div>
            ),
            {
              duration: 8000,
              position: "top-right",
            }
          );
        });
      } catch {
        // Silently fail — no need to surface polling errors
      }
    }

    // Start polling
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null; // This component renders nothing itself
}

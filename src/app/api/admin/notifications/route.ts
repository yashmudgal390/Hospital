import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { contactMessages } from "@/db/schema/contactMessages";
import { appointments } from "@/db/schema/appointments";
import { reviews } from "@/db/schema/reviews";
import { desc, gt } from "drizzle-orm";

/**
 * GET /api/admin/notifications?since=<ISO_TIMESTAMP>
 *
 * Returns new messages, appointments, and reviews created AFTER
 * the `since` timestamp. Called by the admin polling hook every 30s.
 */
export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ newMessages: 0, newAppointments: 0, newReviews: 0, items: [] });
    }

    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");

    if (!since) {
      return NextResponse.json({ newMessages: 0, newAppointments: 0, newReviews: 0, items: [] });
    }

    const sinceDate = new Date(since);

    const [newMessages, newAppointments, newReviews] = await Promise.all([
      db
        .select({
          id: contactMessages.id,
          name: contactMessages.senderName,
          subject: contactMessages.subject,
          createdAt: contactMessages.createdAt,
        })
        .from(contactMessages)
        .where(gt(contactMessages.createdAt, sinceDate))
        .orderBy(desc(contactMessages.createdAt))
        .limit(10),

      db
        .select({
          id: appointments.id,
          name: appointments.patientName,
          service: appointments.serviceName,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .where(gt(appointments.createdAt, sinceDate))
        .orderBy(desc(appointments.createdAt))
        .limit(10),

      db
        .select({
          id: reviews.id,
          name: reviews.patientName,
          rating: reviews.rating,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(gt(reviews.createdAt, sinceDate))
        .orderBy(desc(reviews.createdAt))
        .limit(10),
    ]);

    const items = [
      ...newMessages.map((m) => ({
        type: "message" as const,
        id: m.id,
        title: `New message from ${m.name}`,
        description: m.subject,
        href: "/admin/messages",
        createdAt: m.createdAt,
      })),
      ...newAppointments.map((a) => ({
        type: "appointment" as const,
        id: a.id,
        title: `New appointment: ${a.name}`,
        description: a.service || "General appointment",
        href: "/admin/appointments",
        createdAt: a.createdAt,
      })),
      ...newReviews.map((r) => ({
        type: "review" as const,
        id: r.id,
        title: `New review from ${r.name}`,
        description: `${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} — pending approval`,
        href: "/admin/reviews",
        createdAt: r.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      newMessages: newMessages.length,
      newAppointments: newAppointments.length,
      newReviews: newReviews.length,
      items,
    });
  } catch (error) {
    console.error("[Notifications GET]", error);
    return NextResponse.json({ newMessages: 0, newAppointments: 0, newReviews: 0, items: [] });
  }
}

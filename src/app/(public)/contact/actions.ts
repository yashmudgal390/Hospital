"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { contactMessages, appointments, settings, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkFormRateLimit } from "@/lib/ratelimit";
import { sendEmail, adminNotifyEmail } from "@/lib/email";
import { ContactMessageEmail } from "@/emails/ContactMessage";
import { CallbackRequestEmail } from "@/emails/CallbackRequest";
import { createId } from "@paralleldrive/cuid2";

// Helper to get client IP cleanly
function getIp() {
  const forwardedFor = headers().get("x-forwarded-for");
  const realIp = headers().get("x-real-ip");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

// Helper: safely parse a date string into a Date object or null
function safeParseDate(val: any): Date | null {
  if (!val || val === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    const ip = getIp();
    const rateLimit = await checkFormRateLimit(ip);

    if (!rateLimit.success) {
      return { error: "Too many requests. Please try again later." };
    }

    // Insert into DB with manual ID and timestamps for stability
    await db.insert(contactMessages).values({
      id: createId(),
      senderName: data.name.trim(),
      senderEmail: data.email.trim(),
      senderPhone: data.phone?.trim() || null,
      subject: data.subject.trim(),
      message: data.message.trim(),
      ipAddress: ip,
      status: "unread",
      isStarred: false,
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send email notification to admin — isolated so SMTP failures don't crash the route
    try {
      if (adminNotifyEmail) {
        await sendEmail({
          to: adminNotifyEmail,
          subject: `New Message: ${data.subject.trim()}`,
          react: ContactMessageEmail({
            senderName: data.name.trim(),
            senderEmail: data.email.trim(),
            senderPhone: data.phone?.trim(),
            subject: data.subject.trim(),
            message: data.message.trim(),
          }),
        });
      }
    } catch (emailError) {
      console.error("[actions] Email notification failed (message still saved):", emailError);
    }

    return { success: true };
  } catch (error: any) {
    console.error("[actions] submitContactMessage full error:", error);
    return { 
      error: `Submission failed: ${error.message || "Unknown error"}`,
      details: JSON.stringify({
        code: error.code,
        detail: error.detail,
        table: error.table,
        column: error.column,
        constraint: error.constraint
      })
    };
  }
}

export async function submitAppointment(data: {
  name: string;
  phone: string;
  email?: string;
  date: string;
  time?: string;
  serviceId?: string;
  reason: string;
}) {
  try {
    const ip = getIp();
    const rateLimit = await checkFormRateLimit(ip);

    if (!rateLimit.success) {
      return { error: "Too many requests. Please try again later." };
    }

    // Check if appointments are globally disabled
    try {
      const [s] = await db.select({ enabled: settings.appointmentsEnabled }).from(settings).where(eq(settings.id, "main")).limit(1);
      if (s && s.enabled === false) {
        return { error: "Online appointment booking is currently disabled. Please call us directly." };
      }
    } catch (settingsError) {
      // If settings lookup fails, allow the appointment through
      console.warn("[actions] Settings check failed, allowing appointment:", settingsError);
    }

    // Resolve service name if ID was provided
    let serviceName: string | null = null;
    if (data.serviceId) {
      try {
        const [svc] = await db.select({ name: services.name }).from(services).where(eq(services.id, data.serviceId)).limit(1);
        if (svc) serviceName = svc.name;
      } catch (svcError) {
        console.warn("[actions] Service lookup failed:", svcError);
      }
    }

    // Sanitize the preferred date
    const parsedDate = safeParseDate(data.date);
    const preferredDateStr = parsedDate 
      ? parsedDate.toISOString().split("T")[0]  // "YYYY-MM-DD" format
      : data.date?.trim() || "Not specified";

    // Generate a reference number
    const referenceNo = `APT-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert into DB with manual ID and timestamps for stability
    await db.insert(appointments).values({
      id: createId(),
      patientName: data.name.trim(),
      patientPhone: data.phone.trim(),
      patientEmail: data.email?.trim() || null,
      preferredDate: preferredDateStr,
      preferredTime: data.time?.trim() || null,
      serviceId: data.serviceId || null,
      serviceName: serviceName,
      reasonForVisit: data.reason.trim(),
      isCallbackRequest: true,
      status: "pending",
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send email notification to admin — isolated so SMTP failures don't crash the route
    try {
      if (adminNotifyEmail) {
        await sendEmail({
          to: adminNotifyEmail,
          subject: `🚨 Appointment Request: ${data.name.trim()}`,
          react: CallbackRequestEmail({
            patientName: data.name.trim(),
            patientPhone: data.phone.trim(),
            preferredDate: preferredDateStr,
            preferredTime: data.time?.trim() || undefined,
          }),
        });
      }
    } catch (emailError) {
      console.error("[actions] Email notification failed (appointment still saved):", emailError);
    }

    return { success: true, referenceNo };
  } catch (error: any) {
    console.error("[actions] submitAppointment full error:", error);
    return { 
      error: `Appointment booking failed: ${error.message || "Unknown error"}`,
      details: JSON.stringify({
        code: error.code,
        detail: error.detail,
        table: error.table,
        column: error.column,
        constraint: error.constraint
      })
    };
  }
}


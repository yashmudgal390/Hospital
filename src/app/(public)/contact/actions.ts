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
      senderPhone: data.phone?.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      ipAddress: ip,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send email notification to admin
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

    return { success: true };
  } catch (error: any) {
    console.error("[actions] submitContactMessage error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return { error: `Submission failed: ${error.message || "Unknown error"}` };
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
    const [s] = await db.select({ enabled: settings.appointmentsEnabled }).from(settings).where(eq(settings.id, "main")).limit(1);
    
    if (s && s.enabled === false) {
      return { error: "Online appointment booking is currently disabled. Please call us directly." };
    }

    // Resolve service name if ID was provided
    let serviceName = undefined;
    if (data.serviceId) {
      const [svc] = await db.select({ name: services.name }).from(services).where(eq(services.id, data.serviceId)).limit(1);
      if (svc) serviceName = svc.name;
    }

    // Insert into DB with manual ID and timestamps for stability
    await db.insert(appointments).values({
      id: createId(),
      patientName: data.name.trim(),
      patientPhone: data.phone.trim(),
      patientEmail: data.email?.trim() || null,
      preferredDate: data.date,
      preferredTime: data.time || null,
      serviceId: data.serviceId || null,
      serviceName: serviceName,
      reasonForVisit: data.reason.trim(),
      // Treat as a callback request since the clinic must call to confirm
      isCallbackRequest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send email notification to admin
    if (adminNotifyEmail) {
      await sendEmail({
        to: adminNotifyEmail,
        subject: `🚨 Appointment Request: ${data.name.trim()}`,
        react: CallbackRequestEmail({
          patientName: data.name.trim(),
          patientPhone: data.phone.trim(),
          preferredDate: data.date,
          preferredTime: data.time || undefined,
        }),
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("[actions] submitAppointment error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return { error: `Appointment booking failed: ${error.message || "Unknown error"}` };
  }
}

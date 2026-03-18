import { Metadata } from "next";
import { db, isDbConfigured } from "@/db";
import { appointments } from "@/db/schema";
import { desc } from "drizzle-orm";
import AppointmentsClient from "./AppointmentsClient";

export const metadata: Metadata = {
  title: "Appointments | Admin Dashboard",
};

export const revalidate = 0; // Prevent caching for admin data

export default async function AppointmentsPage() {
  let data: any[] = [];

  if (isDbConfigured) {
    try {
      data = await db
        .select()
        .from(appointments)
        .orderBy(desc(appointments.createdAt));
    } catch (err) {
      console.warn("[AppointmentsPage] DB error:", (err as Error).message);
    }
  }

  return <AppointmentsClient data={data} />;
}

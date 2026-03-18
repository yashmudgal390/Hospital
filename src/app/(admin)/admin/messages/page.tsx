import { Metadata } from "next";
import { db, isDbConfigured } from "@/db";
import { contactMessages } from "@/db/schema";
import { desc } from "drizzle-orm";
import MessagesClient from "./MessagesClient";

export const metadata: Metadata = {
  title: "Inbox | Admin Dashboard",
};

export const revalidate = 0; // Prevent caching for admin data

export default async function MessagesPage() {
  let data: any[] = [];

  if (isDbConfigured) {
    try {
      data = await db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt));
    } catch (err) {
      console.warn("[MessagesPage] DB error:", (err as Error).message);
    }
  }

  return <MessagesClient data={data} />;
}

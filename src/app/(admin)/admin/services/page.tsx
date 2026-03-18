import { Metadata } from "next";
import { db, isDbConfigured } from "@/db";
import { services } from "@/db/schema";
import { desc } from "drizzle-orm";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Services | Admin Dashboard",
};

export const revalidate = 0;

export default async function ServicesPage() {
  let data: any[] = [];

  if (isDbConfigured) {
    try {
      data = await db
        .select({
          id: services.id,
          name: services.name,
          slug: services.slug,
          isActive: services.isActive,
          isFeatured: services.isFeatured,
          sortOrder: services.sortOrder,
          createdAt: services.createdAt,
        })
        .from(services)
        .orderBy(services.sortOrder, desc(services.createdAt));
    } catch (err) {
      console.warn("[ServicesPage] DB error:", (err as Error).message);
    }
  }

  return <ServicesClient data={data} />;
}

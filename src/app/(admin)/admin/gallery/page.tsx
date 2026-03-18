import { Metadata } from "next";
import { db, isDbConfigured } from "@/db";
import { gallery } from "@/db/schema";
import { desc } from "drizzle-orm";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery Management | Admin",
};

export const revalidate = 0;

export default async function GalleryPage() {
  let data: any[] = [];

  if (isDbConfigured) {
    try {
      data = await db
        .select()
        .from(gallery)
        .orderBy(desc(gallery.createdAt));
    } catch (err) {
      console.warn("[GalleryPage] DB error:", (err as Error).message);
    }
  }

  return <GalleryClient data={data} />;
}

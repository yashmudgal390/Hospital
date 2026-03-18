import { Metadata } from "next";
import { db, isDbConfigured } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsTabs } from "@/components/admin/SettingsTabs";

export const metadata: Metadata = {
  title: "Settings | Admin Dashboard",
};

export default async function AdminSettingsPage() {
  let data: any = null;

  if (isDbConfigured) {
    try {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.id, "main"))
        .limit(1);
      data = result[0];
    } catch (err) {
      console.warn("[SettingsPage] DB error:", (err as Error).message);
    }
  }

  return <SettingsTabs initialData={data || {}} />;
}

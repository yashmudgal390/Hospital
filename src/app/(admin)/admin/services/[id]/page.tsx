import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata: Metadata = {
  title: "Edit Service | Admin",
};

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const [data] = await db
    .select()
    .from(services)
    .where(eq(services.id, params.id))
    .limit(1);

  if (!data) notFound();

  return <ServiceForm initialData={data} />;
}

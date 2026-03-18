import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { blog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const metadata: Metadata = {
  title: "Edit Article | Admin",
};

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const [data] = await db
    .select()
    .from(blog)
    .where(eq(blog.id, params.id))
    .limit(1);

  if (!data) notFound();

  return <BlogEditor initialData={data} />;
}

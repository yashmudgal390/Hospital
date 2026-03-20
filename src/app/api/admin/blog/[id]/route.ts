import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { blog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured. Cannot update blog." }, { status: 400 });
    }

    const body = await req.json();
    
    // Clean up body to only include updatable fields and handle dates
    const { id: _id, createdAt: _c, updatedAt: _u, ...updateData } = body;
    
    const payload: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (updateData.publishedAt) {
      const d = new Date(updateData.publishedAt);
      payload.publishedAt = isNaN(d.getTime()) ? null : d;
    } else {
      payload.publishedAt = null;
    }

    const [updated] = await db
      .update(blog)
      .set(payload)
      .where(eq(blog.id, params.id))
      .returning();
    
    // Defensive revalidation
    try {
      revalidateTag("blog");
      revalidatePath("/blog");
      if (updated && updated.slug) revalidatePath(`/blog/${updated.slug}`);
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Blog PUT] Revalidation failed:", revalError);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[Blog PUT Error Details]:", error);
    return NextResponse.json({ 
      error: "Error updating blog post",
      details: error.message || "Unknown database error"
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured. Cannot delete blog." }, { status: 400 });
    }

    await db.delete(blog).where(eq(blog.id, params.id));
    // Defensive revalidation
    try {
      revalidateTag("blog");
      revalidatePath("/blog");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Blog DELETE] Revalidation failed:", revalError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Blog DELETE Error Details]:", error);
    return NextResponse.json({ 
      error: "Error deleting blog post",
      details: error.message || "Unknown database error" 
    }, { status: 500 });
  }
}

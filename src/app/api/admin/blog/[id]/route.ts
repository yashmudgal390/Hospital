import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { blog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    
    revalidateTag("blog");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[Blog PUT Error]:", error.message || error);
    return NextResponse.json({ error: error.message || "Error updating blog post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await db.delete(blog).where(eq(blog.id, params.id));
    revalidateTag("blog");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting blog post" }, { status: 500 });
  }
}

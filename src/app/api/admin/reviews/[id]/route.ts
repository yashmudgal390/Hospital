import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured" }, { status: 400 });
    }

    const { id } = params;
    const body = await req.json();

    const [updatedReview] = await db
      .update(reviews)
      .set({ isApproved: body.isApproved })
      .where(eq(reviews.id, id))
      .returning();

    try {
      revalidatePath("/");
      revalidatePath("/admin/reviews");
    } catch (e) {
      console.warn("Revalidation error", e);
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("[Review PATCH] error", error);
    return NextResponse.json({ error: "Error updating review" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured" }, { status: 400 });
    }

    const { id } = params;
    await db.delete(reviews).where(eq(reviews.id, id));

    try {
      revalidatePath("/");
      revalidatePath("/admin/reviews");
    } catch (e) {
      console.warn("Revalidation error", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Review DELETE] error", error);
    return NextResponse.json({ error: "Error deleting review" }, { status: 500 });
  }
}

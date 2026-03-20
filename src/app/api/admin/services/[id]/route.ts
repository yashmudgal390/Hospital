import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured. Cannot update service." }, { status: 400 });
    }

    const body = await req.json();
    body.updatedAt = new Date();

    const [updated] = await db
      .update(services)
      .set(body)
      .where(eq(services.id, params.id))
      .returning();
    // Defensive revalidation
    try {
      revalidateTag("services");
      revalidatePath("/services");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Services PUT] Revalidation failed:", revalError);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[Services PUT Error Details]:", error);
    return NextResponse.json({ 
      error: "Error updating service",
      details: error.message || "Unknown database error"
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured. Cannot delete service." }, { status: 400 });
    }

    await db.delete(services).where(eq(services.id, params.id));
    
    // Defensive revalidation
    try {
      revalidateTag("services");
      revalidatePath("/services");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Services DELETE] Revalidation failed:", revalError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Services DELETE Error Details]:", error);
    return NextResponse.json({ 
      error: "Error deleting service",
      details: error.message || "Unknown database error"
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { services } from "@/db/schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json({ error: "Database not configured" }, { status: 400 });
    }

    const body = await req.json();

    const [newService] = await db
      .insert(services)
      .values({
        ...body,
        id: body.id || createId(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Defensive revalidation
    try {
      revalidateTag("services");
      revalidatePath("/services");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Services POST] Revalidation failed:", revalError);
    }

    return NextResponse.json(newService);
  } catch (error: any) {
    console.error("[Services POST Error]:", error);
    return NextResponse.json({ 
      error: "Error creating service",
      details: error.message || "Unknown database error"
    }, { status: 500 });
  }
}

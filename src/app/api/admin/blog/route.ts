import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { blog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isDbConfigured) {
      return NextResponse.json({ 
        error: "Database not configured. Cannot create blog. Setup DATABASE_URL in .env.local first." 
      }, { status: 400 });
    }

    const body = await req.json();

    // Ensure date fields are real Date objects for the DB driver
    // and manually set ID/Timestamps to bypass driver-level issues
    const insertData = {
      ...body,
      id: body.id || createId(),
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [newPost] = await db
      .insert(blog)
      .values(insertData)
      .returning();
    
    // Defensive revalidation
    try {
      revalidateTag("blog");
      revalidatePath("/blog");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Blog POST] Revalidation failed:", revalError);
    }

    return NextResponse.json(newPost);
  } catch (error: any) {
    console.error("[Blog POST Error Details]:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    
    return NextResponse.json({ 
      error: "Error creating blog post",
      details: error.message || "Unknown database error"
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { gallery } from "@/db/schema";
import { revalidateTag } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (!isDbConfigured) {
      console.warn("[Gallery API] Attempted to save with placeholder DB.");
      return NextResponse.json({ 
        error: "Database not configured. Cannot save gallery. Setup DATABASE_URL in .env.local first." 
      }, { status: 400 });
    }

    const { 
      imageUrl, cloudinaryPublicId, altText, 
      caption, category, sortOrder, isActive 
    } = body;
    
    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
    }

    // Step 4: Perform the Insert with explicit fields to be safe
    const [newPhoto] = await db
      .insert(gallery)
      .values({
        id: createId(), // Explicitly generate ID to bypass driver issues
        imageUrl,
        cloudinaryPublicId,
        altText: altText || "",
        caption: caption || null,
        category: category || "General",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(), // Explicitly set timestamp
      })
      .returning();
    
    // Step 5: Refresh the public page
    try {
      revalidateTag("gallery");
    } catch (revalidateError) {
      console.warn("[Gallery API] Revalidation failed (non-fatal):", revalidateError);
    }

    return NextResponse.json(newPhoto);
  } catch (error: any) {
    console.error("[Gallery API Error Details]:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    
    return NextResponse.json({ 
      error: "Error adding gallery photo",
      details: error.message || "Unknown database error"
    }, { status: 500 });
  }
}

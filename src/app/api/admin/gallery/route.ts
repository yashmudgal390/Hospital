import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db, isDbConfigured } from "@/db";
import { gallery } from "@/db/schema";
import { revalidateTag } from "next/cache";

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

    const [newPhoto] = await db
      .insert(gallery)
      .values({
        imageUrl,
        cloudinaryPublicId,
        altText: altText || "",
        caption,
        category: category || "General",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();
    
    revalidateTag("gallery");

    return NextResponse.json(newPhoto);
  } catch (error: any) {
    console.error("[Gallery API Error]", error);
    return NextResponse.json({ error: "Error adding gallery photo" }, { status: 500 });
  }
}

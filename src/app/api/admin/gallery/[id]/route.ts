import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { gallery } from "@/db/schema/gallery";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath, revalidateTag } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      imageUrl, cloudinaryPublicId, altText, 
      caption, category, sortOrder, isActive 
    } = body;

    const [updated] = await db
      .update(gallery)
      .set({
        imageUrl,
        cloudinaryPublicId, // Keeps the reference for deletion
        altText: altText || "",
        caption: caption || null,
        category: category || "General",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .where(eq(gallery.id, params.id))
      .returning();

    // Defensive revalidation
    try {
      revalidateTag("gallery");
      revalidatePath("/gallery");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Gallery PUT] Revalidation failed:", revalError);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating gallery photo" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the record first to get the URL
    const [record] = await db.select().from(gallery).where(eq(gallery.id, params.id)).limit(1);
    
    if (record && record.cloudinaryPublicId) {
      // We previously saved the Supabase Storage filename in the cloudinaryPublicId field during upload
      const fileName = record.cloudinaryPublicId;
      console.log(`[Supabase Storage] Deleting file: ${fileName}`);
      
      const { error } = await supabaseAdmin
        .storage
        .from("hospital-images")
        .remove([fileName]);

      if (error) {
         console.warn("Failed to delete from Supabase Storage, continuing DB deletion:", error);
      }
    }

    await db.delete(gallery).where(eq(gallery.id, params.id));
    
    // Defensive revalidation
    try {
      revalidateTag("gallery");
      revalidatePath("/gallery");
      revalidatePath("/");
    } catch (revalError) {
      console.warn("[Gallery DELETE] Revalidation failed:", revalError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting gallery photo" }, { status: 500 });
  }
}


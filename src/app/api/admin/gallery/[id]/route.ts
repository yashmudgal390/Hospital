import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteImageByUrl } from "@/lib/cloudinary";
import { revalidatePath, revalidateTag } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    body.createdAt = undefined; // don't update

    const [updated] = await db
      .update(gallery)
      .set(body)
      .where(eq(gallery.id, params.id))
      .returning();
    
    revalidateTag("gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating gallery photo" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session || !session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the record first to get the URL
    const [record] = await db.select().from(gallery).where(eq(gallery.id, params.id)).limit(1);
    
    if (record && record.imageUrl) {
      // Attempt to delete from Cloudinary
       await deleteImageByUrl(record.imageUrl).catch(err => {
         console.warn("Failed to delete from Cloudinary, continuing DB deletion:", err);
       });
    }

    await db.delete(gallery).where(eq(gallery.id, params.id));
    revalidateTag("gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting gallery photo" }, { status: 500 });
  }
}
